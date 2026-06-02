import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import * as tosixApi from '../api/tosixApi'
import type { SiteSetting } from '../types/api'
import { SiteFooter } from '../components/SiteFooter'
import { ZaloIcon } from '../components/ZaloIcon'
import { brandName } from '../utils/brand'
import { resolveZaloUrl } from '../utils/zalo'

const DEFAULT_POLICY = `## Đổi sản phẩm
- Thời gian: Trong vòng 3 ngày kể từ ngày khách hàng nhận được sản phẩm.
- Áp dụng: Chỉ với sản phẩm khác có giá bằng hoặc cao hơn. Không hoàn tiền chênh lệch khi đổi sang sản phẩm có giá thấp hơn.
- Điều kiện: Sản phẩm còn nguyên vẹn bao bì, đầy đủ phụ kiện, chưa qua sử dụng. Khách hàng chịu chi phí vận chuyển.

## Trả hàng
- Thời gian: Trong vòng 3 ngày kể từ ngày khách hàng nhận được sản phẩm.
- Áp dụng: Hoàn tiền 100%, cửa hàng chịu chi phí vận chuyển.
- Điều kiện: Sản phẩm có lỗi từ nhà sản xuất.

## Số lần đổi hàng
- Áp dụng 1 lần duy nhất cho mỗi đơn hàng.

## Bảo hành
- Đèn trang trí: 1 năm.
- Quạt: Động cơ 2 năm, điều khiển 1 năm.

## Nơi nhận bảo hành
- Đèn: Gửi phụ kiện hoặc sản phẩm mới thay thế.
- Quạt: Gửi đến trung tâm bảo hành.

## Lưu ý quan trọng
- Bóng đèn tặng kèm không áp dụng chế độ bảo hành.
- Khách hàng vui lòng quay video khi mở hàng và phản hồi lỗi (nếu có) trong vòng 24 giờ. Sau 24 giờ, cửa hàng không chịu trách nhiệm về các lỗi phát sinh.`

type PolicyLine = { type: 'bullet' | 'text'; content: string }
type PolicySection = { title: string; lines: PolicyLine[]; isNote: boolean }

function parsePolicy(raw: string): PolicySection[] {
  const sections: PolicySection[] = []
  let current: PolicySection | null = null

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^#+\s*/, '').trim()
      current = { title, lines: [], isNote: /lưu ý/i.test(title) }
      sections.push(current)
    } else if (trimmed.startsWith('-')) {
      const content = trimmed.replace(/^-\s*/, '').trim()
      if (!current) {
        current = { title: 'Chính sách', lines: [], isNote: false }
        sections.push(current)
      }
      current.lines.push({ type: 'bullet', content })
    } else {
      if (!current) {
        current = { title: 'Chính sách', lines: [], isNote: false }
        sections.push(current)
      }
      current.lines.push({ type: 'text', content: trimmed })
    }
  }

  return sections
}

/** Render các dòng của một mục: gom bullet liền nhau vào <ul>, dòng thường thành <p>. */
function renderLines(lines: PolicyLine[]) {
  const blocks: ReactNode[] = []
  let bulletRun: PolicyLine[] = []

  const flush = () => {
    if (bulletRun.length === 0) return
    const items = bulletRun
    blocks.push(
      <ul className="tosix-policy-list" key={`ul-${blocks.length}`}>
        {items.map((line, j) => (
          <li key={j}>{renderBullet(line.content)}</li>
        ))}
      </ul>,
    )
    bulletRun = []
  }

  for (const line of lines) {
    if (line.type === 'bullet') {
      bulletRun.push(line)
    } else {
      flush()
      blocks.push(
        <p className="tosix-policy-text" key={`p-${blocks.length}`}>
          {renderBullet(line.content)}
        </p>,
      )
    }
  }
  flush()
  return blocks
}

/** Tách "Nhãn: phần còn lại" để in đậm nhãn. */
function renderBullet(content: string) {
  const idx = content.indexOf(':')
  if (idx > 0 && idx <= 24) {
    return (
      <>
        <strong>{content.slice(0, idx)}:</strong>
        {content.slice(idx + 1)}
      </>
    )
  }
  return content
}

export function PolicyPage() {
  const [settings, setSettings] = useState<SiteSetting | null>(null)

  useEffect(() => {
    void tosixApi.fetchSettings().then(setSettings)
  }, [])

  const sections = useMemo(
    () => parsePolicy(settings?.policyContent?.trim() || DEFAULT_POLICY),
    [settings?.policyContent],
  )

  if (!settings) return <div className="tosix-loading">Đang tải…</div>

  const brand = brandName(settings)
  const phone1 = settings.phonePrimary.replace(/\s/g, '')
  const zaloHref = resolveZaloUrl(settings.zaloUrl, settings.phonePrimary)

  let counter = 0

  return (
    <div>
      <section className="tosix-page-hero">
        <div className="tosix-container">
          <span className="tosix-eyebrow">Chính sách</span>
          <h1>Chính sách đổi trả &amp; bảo hành</h1>
          <p className="tosix-page-hero-desc">
            {brand} cam kết minh bạch về điều kiện đổi trả và bảo hành để bạn an tâm mua sắm.
          </p>
        </div>
      </section>

      <section className="tosix-section tosix-container">
        <div className="tosix-policy">
          {sections.map((section, i) => {
            if (!section.isNote) counter += 1
            const badge = section.isNote ? '!' : String(counter).padStart(2, '0')
            return (
              <article
                key={i}
                className={`tosix-policy-card${section.isNote ? ' tosix-policy-card--note' : ''}`}
              >
                <div className="tosix-policy-card-head">
                  <span className="tosix-policy-num" aria-hidden="true">
                    {badge}
                  </span>
                  <h2>{section.title}</h2>
                </div>
                {renderLines(section.lines)}
              </article>
            )
          })}
        </div>

        <div className="tosix-policy-contact">
          <div>
            <h3>Cần hỗ trợ về đổi trả &amp; bảo hành?</h3>
            <p>Liên hệ {brand} để được tư vấn nhanh nhất.</p>
          </div>
          <div className="tosix-policy-contact-actions">
            <a href={zaloHref} target="_blank" rel="noreferrer" className="tosix-btn tosix-btn--zalo">
              <ZaloIcon size={18} /> Chat Zalo
            </a>
            <a href={`tel:${phone1}`} className="tosix-btn tosix-btn--primary">
              Gọi {settings.phonePrimary}
            </a>
            <Link to="/lien-he" className="tosix-btn tosix-btn--secondary">
              Trang liên hệ
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </div>
  )
}
