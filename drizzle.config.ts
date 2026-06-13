import { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { desc, gt } from 'drizzle-orm'
import { posts } from './db/schema'

// 環境変数の型定義
type Bindings = {
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// レイアウト用コンポーネント (Pico.cssを読み込み)
const Layout = (props: { children: any }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" />
        <title>One-Liner Board</title>
      </head>
      <body>
        <main className="container" style={{ paddingTop: '2rem' }}>
          {props.children}
        </main>
      </body>
    </html>
  )
}

// GET / : 一覧表示と投稿フォーム
app.get('/', async (c) => {
  // DB接続 (エッジ環境なのでリクエスト毎に作成)
  const sql = neon(c.env.DATABASE_URL)
  const db = drizzle(sql)

  // データを取得 (作成日時の新しい順。直近24時間分)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const allPosts = await db.select().from(posts).where(gt(posts.createdAt, oneDayAgo)).orderBy(desc(posts.createdAt))

  return c.html(
    <Layout>
      <h1>💬 匿名ひとこと掲示板</h1>

      {/* 投稿フォーム */}
      <div style={{ backgroundColor: '#eeeeee', padding: '3rem', borderRadius: '8px' }}>
        <form method="post" action="/">
          <label>
            今なに考えてる？
            <input style={{backgroundColor: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}} name="content" placeholder="ここに入力..." required />
          </label>
          <button type="submit">投稿する</button>
        </form>
      </div>

      {/* 投稿一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {allPosts.map((post) => (
          <div key={post.id} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
              <small style={{ color: '#888' }}>#{post.id}</small>
              <small style={{ color: '#888' }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
              </small>
            </div>
            <span style={{ whiteSpace: 'pre-wrap' }}>{post.content}</span>
          </div>
        ))}
      </div>
    </Layout>
  )
})

// POST / : データの保存処理
app.post('/', async (c) => {
  const sql = neon(c.env.DATABASE_URL)
  const db = drizzle(sql)

  // フォームの内容を取得
  const body = await c.req.parseBody()
  const content = String(body.content)

  if (content) {
    // DBに保存
    await db.insert(posts).values({ content })
  }

  // トップページへリダイレクト
  return c.redirect('/')
})

export default app
