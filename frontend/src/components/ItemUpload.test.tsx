import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ItemUpload } from './ItemUpload'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

// フォームのクライアント側バリデーション(画像・商品・説明)をすべて満たしてから送信する
async function fillValidForm(container: HTMLElement) {
  // 商品を1件追加
  await userEvent.type(screen.getAllByRole('textbox')[1], 'シャツ') // 商品名
  await userEvent.type(screen.getAllByRole('textbox')[2], 'MyBrand') // ブランド
  await userEvent.type(screen.getAllByRole('textbox')[3], 'tops') // カテゴリー
  await userEvent.type(screen.getAllByRole('textbox')[4], 'http://example.com') // URL
  await userEvent.click(screen.getByRole('button', { name: '商品を追加する' }))
  // 説明
  await userEvent.type(screen.getAllByRole('textbox')[0], 'コーデ説明')
  // 画像
  const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
  await userEvent.upload(fileInput, file)
}

describe('ItemUpload', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    localStorage.setItem('access_token', 'dummy-token')
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('投稿失敗時にサーバーの具体的なメッセージ(detail)をそのまま表示する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ detail: '画像の保存に失敗しました。時間をおいて再度お試しください。' }),
      }),
    )

    const { container } = render(
      <MemoryRouter>
        <ItemUpload />
      </MemoryRouter>,
    )

    await fillValidForm(container)
    await userEvent.click(screen.getByRole('button', { name: '出品する' }))

    expect(
      await screen.findByText('画像の保存に失敗しました。時間をおいて再度お試しください。'),
    ).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('detail が無いときは汎用メッセージにフォールバックする', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    )

    const { container } = render(
      <MemoryRouter>
        <ItemUpload />
      </MemoryRouter>,
    )

    await fillValidForm(container)
    await userEvent.click(screen.getByRole('button', { name: '出品する' }))

    expect(
      await screen.findByText('出品できませんでした。時間をおいて再度お試しください。'),
    ).toBeInTheDocument()
  })
})
