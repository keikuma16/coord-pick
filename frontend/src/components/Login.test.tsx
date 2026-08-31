import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Login } from './Login'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Login', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ログイン成功時にトークンを保存して一覧へ遷移する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'dummy-token' }),
      }),
    )

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('dummy-token')
    })
    expect(navigateMock).toHaveBeenCalledWith('/items')
  })

  it('ログイン失敗時にサーバーのエラーメッセージを表示し、遷移しない', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'パスワードが違います' }),
      }),
    )

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('********'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(await screen.findByText('パスワードが違います')).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('サーバーに繋がらないとき、沈黙せず通信エラーのメッセージを表示する', async () => {
    // fetch 自体が reject するケース(サーバーダウン・オフライン)。
    // 以前は try/catch が無く、押しても何も起きず沈黙していた。
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(
      await screen.findByText('通信に失敗しました。時間をおいて再度お試しください。'),
    ).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
