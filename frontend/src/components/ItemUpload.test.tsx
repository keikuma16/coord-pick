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

// フォームのクライアント側バリデーション(画像・商品・説明)をすべて満たしてから送信する。
// label と入力欄を紐付けたので、並び順ではなく項目名で引ける。
async function fillValidForm(container: HTMLElement) {
  // 商品を1件追加
  await userEvent.type(screen.getByLabelText('商品名'), 'シャツ')
  await userEvent.type(screen.getByLabelText('ブランド'), 'MyBrand')
  await userEvent.selectOptions(screen.getByLabelText('カテゴリー'), 'tops')
  await userEvent.type(screen.getByLabelText('商品URL'), 'http://example.com')
  await userEvent.click(screen.getByRole('button', { name: '商品を追加する' }))
  // 説明
  await userEvent.type(screen.getByLabelText('Styling説明'), 'コーデ説明')
  // 画像
  const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
  await userEvent.upload(fileInput, file)
}

// 商品1件ぶんの入力。状態(新品/古着)と URL は呼び出し側で決める
async function fillItemFields(name: string) {
  await userEvent.type(screen.getByLabelText('商品名'), name)
  await userEvent.type(screen.getByLabelText('ブランド'), 'MyBrand')
  await userEvent.selectOptions(screen.getByLabelText('カテゴリー'), 'tops')
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

describe('ItemUpload の商品追加', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    localStorage.setItem('access_token', 'dummy-token')
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('新品はURLが無いと追加できない', async () => {
    // 購入先に飛べることがこのサービスの中身なので、新品はURLを必須にする
    render(
      <MemoryRouter>
        <ItemUpload />
      </MemoryRouter>,
    )

    await fillItemFields('シャツ')
    await userEvent.click(screen.getByRole('button', { name: '商品を追加する' }))

    expect(await screen.findByText('商品URLを入力してください。')).toBeInTheDocument()
    expect(screen.getByText('0 件を追加済み')).toBeInTheDocument()
  })

  it('古着はURLが無くても追加できる', async () => {
    // 古着は一点物で、買える場所が無いこともある
    render(
      <MemoryRouter>
        <ItemUpload />
      </MemoryRouter>,
    )

    await fillItemFields('ヴィンテージT')
    await userEvent.click(screen.getByRole('radio', { name: /古着/ }))
    await userEvent.click(screen.getByRole('button', { name: '商品を追加する' }))

    expect(await screen.findByText('1 件を追加済み')).toBeInTheDocument()
    expect(screen.getByText('購入先URLなし')).toBeInTheDocument()
  })

  it('カテゴリーを選ばないと追加できない', async () => {
    render(
      <MemoryRouter>
        <ItemUpload />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText('商品名'), 'シャツ')
    await userEvent.type(screen.getByLabelText('ブランド'), 'MyBrand')
    await userEvent.type(screen.getByLabelText('商品URL'), 'https://example.com/1')
    await userEvent.click(screen.getByRole('button', { name: '商品を追加する' }))

    expect(await screen.findByText('カテゴリーを選んでください。')).toBeInTheDocument()
  })

  it('形式が壊れたURLは追加できない', async () => {
    render(
      <MemoryRouter>
        <ItemUpload />
      </MemoryRouter>,
    )

    await fillItemFields('シャツ')
    await userEvent.type(screen.getByLabelText('商品URL'), 'example.com/1')
    await userEvent.click(screen.getByRole('button', { name: '商品を追加する' }))

    expect(
      await screen.findByText('商品URLは http:// または https:// から始まる形式で入力してください。'),
    ).toBeInTheDocument()
  })
})
