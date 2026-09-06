import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'

// exp は秒。署名は検証しないので、payload だけ本物と同じ形にする
const makeToken = (expiresInSeconds: number) => {
  const payload = { user_id: 1, user_name: 'taro', exp: Math.floor(Date.now() / 1000) + expiresInSeconds }
  return `header.${btoa(JSON.stringify(payload))}.signature`
}

const renderUploadRoute = () =>
  render(
    <MemoryRouter initialEntries={['/upload']}>
      <Routes>
        <Route
          path="/upload"
          element={
            <RequireAuth>
              <p>投稿フォーム</p>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<p>ログイン画面</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('未ログインなら中身を見せずログイン画面へ送る', async () => {
    renderUploadRoute()

    expect(screen.getByText('ログイン画面')).toBeInTheDocument()
    expect(screen.queryByText('投稿フォーム')).not.toBeInTheDocument()
  })

  it('期限切れのトークンは未ログインとして扱い、残さず消す', async () => {
    // 期限切れを通すと、フォームを全部埋めたあとに 401 で弾かれ入力が消える
    localStorage.setItem('access_token', makeToken(-60))

    renderUploadRoute()

    expect(screen.getByText('ログイン画面')).toBeInTheDocument()
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('有効なトークンがあれば中身を表示する', async () => {
    localStorage.setItem('access_token', makeToken(600))

    renderUploadRoute()

    expect(screen.getByText('投稿フォーム')).toBeInTheDocument()
  })
})
