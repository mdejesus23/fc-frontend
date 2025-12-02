import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShiftList from '../ShiftList.vue'
import api from '@/services/apiConfig'

// ------------- FIX: Define proper mock shape ---------------
type ApiMock = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
}

// ------------- FIX: Vitest mock for apiConfig ---------------
vi.mock('@/services/apiConfig', () => {
  const mockApi: ApiMock = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  }
  return { default: mockApi }
})

// Cast imported api to the mock type
const mockedApi = api as unknown as ApiMock

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('ShiftList.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default GET responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/workers') {
        return Promise.resolve({ data: [] })
      }
      if (url === '/shifts') {
        return Promise.resolve({ data: [] })
      }
      if (url === '/timezones') {
        return Promise.resolve({
          data: { timezones: [{ key: 'utc', timezone: 'UTC' }] },
        })
      }
      return Promise.resolve({ data: [] })
    })
  })

  const toLocal = (d: Date) => d.toISOString().slice(0, 16)

  it('adds a shift successfully', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/workers') {
        return Promise.resolve({
          data: [{ id: 'w1', name: 'Alice' }],
        })
      }
      if (url === '/shifts') return Promise.resolve({ data: [] })
      if (url === '/timezones')
        return Promise.resolve({
          data: { timezones: [{ key: 'utc', timezone: 'UTC' }] },
        })
      return Promise.resolve({ data: [] })
    })

    mockedApi.post.mockResolvedValue({})

    const wrapper = mount(ShiftList)
    await flush()

    const selects = wrapper.findAll('select')

    await selects[0]?.setValue('UTC')
    await selects[1]?.setValue('w1')

    const now = new Date()
    const start = new Date(now.getTime() + 1 * 60 * 60 * 1000)
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const inputs = wrapper.findAll('input[type="datetime-local"]')
    await inputs[0]?.setValue(toLocal(start))
    await inputs[1]?.setValue(toLocal(end))

    const addBtn = wrapper.find('button')
    await addBtn.trigger('click')

    expect(mockedApi.post).toHaveBeenCalledWith('shifts', {
      tz_str: 'UTC',
      worker_id: 'w1',
      start: toLocal(start),
      end: toLocal(end),
    })
  })

  it('shows error when backend rejects >12 hours', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/workers') {
        return Promise.resolve({
          data: [{ id: 'w2', name: 'Bob' }],
        })
      }
      if (url === '/shifts') return Promise.resolve({ data: [] })
      if (url === '/timezones')
        return Promise.resolve({
          data: { timezones: [{ key: 'utc', timezone: 'UTC' }] },
        })
      return Promise.resolve({ data: [] })
    })

    mockedApi.post.mockRejectedValue(new Error('Shift exceeds 12 hours'))

    const wrapper = mount(ShiftList)
    await flush()

    const selects = wrapper.findAll('select')
    await selects[0]?.setValue('UTC')
    await selects[1]?.setValue('w2')

    const now = new Date()
    const start = new Date(now.getTime() + 1 * 60 * 60 * 1000)
    const end = new Date(now.getTime() + 13 * 60 * 60 * 1000)

    const inputs = wrapper.findAll('input[type="datetime-local"]')
    await inputs[0]?.setValue(toLocal(start))
    await inputs[1]?.setValue(toLocal(end))

    const addBtn = wrapper.find('button')
    await addBtn.trigger('click')

    await flush()

    expect(wrapper.text()).toContain('Shift exceeds 12 hours')
  })

  it('rejects overlapping shifts', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/workers') {
        return Promise.resolve({
          data: [{ id: 'w3', name: 'Charlie' }],
        })
      }
      if (url === '/shifts') {
        return Promise.resolve({
          data: [
            {
              id: 's1',
              worker_id: 'w3',
              start: '2025-01-01T10:00',
              end: '2025-01-01T12:00',
              duration_hours: 2,
            },
          ],
        })
      }
      if (url === '/timezones')
        return Promise.resolve({
          data: { timezones: [{ key: 'utc', timezone: 'UTC' }] },
        })
      return Promise.resolve({ data: [] })
    })

    mockedApi.post.mockRejectedValue(new Error('Shift overlaps existing shift'))

    const wrapper = mount(ShiftList)
    await flush()

    const selects = wrapper.findAll('select')
    await selects[0]?.setValue('UTC')
    await selects[1]?.setValue('w3')

    const inputs = wrapper.findAll('input[type="datetime-local"]')
    await inputs[0]?.setValue('2025-01-01T11:00')
    await inputs[1]?.setValue('2025-01-01T13:00')

    const addBtn = wrapper.find('button')
    await addBtn.trigger('click')

    await flush()

    expect(wrapper.text()).toContain('Shift overlaps existing shift')
  })
})
