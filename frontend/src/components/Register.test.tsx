import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Register } from './Register'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Register', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('メールアドレス未入力の場合はAPIを呼ばずにバリデーションエラーを表示する', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    // ユーザー名だけ入れて、メール未入力のバリデーションに到達させる
    await userEvent.type(screen.getByPlaceholderText('例: 太郎'), 'taro')
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))

    expect(await screen.findByText('メールアドレスを入力してください。')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ユーザー名未入力の場合はAPIを呼ばずにバリデーションエラーを表示する', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    // 初期値を空にしたので、何も入れずに送るとユーザー名で止まる
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))

    expect(await screen.findByText('ユーザー名を入力してください。')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('登録成功時に一覧へ遷移する', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('例: 太郎'), 'user_taro')
    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/items')
    })
  })

  it('登録失敗時にサーバーのエラーメッセージ(重複メール等)を表示する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'このメールアドレスは既に登録されています' }),
      }),
    )

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('例: 太郎'), 'dup_user')
    await userEvent.type(screen.getByPlaceholderText('example@mail.com'), 'dup@example.com')
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: '新規登録' }))

    expect(
      await screen.findByText('このメールアドレスは既に登録されています'),
    ).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
