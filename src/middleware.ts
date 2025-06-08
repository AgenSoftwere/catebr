// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const desligado = true

  if (desligado) {
    const html = `
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Site Indisponível</title>
          <style>
            body {
              background-color: #0f172a;
              color: #f8fafc;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: 'Segoe UI', sans-serif;
              text-align: center;
              padding: 2rem;
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 1rem;
              color: #38bdf8;
            }
            p {
              font-size: 1.2rem;
              max-width: 500px;
              color: #cbd5e1;
            }
          </style>
        </head>
        <body>
          <h1>🔌 Site desligado</h1>
          <p>
            Nossos servidores foram desativados e o site está fora do ar.<br />
            No momento, não há previsão de retorno. Agradecemos por ter feito parte dessa jornada.
          </p>
        </body>
      </html>
    `
    return new NextResponse(html, {
      status: 503,
      headers: {
        'Content-Type': 'text/html',
        'Retry-After': '86400' // 24 horas
      }
    })
  }

  return NextResponse.next()
}
