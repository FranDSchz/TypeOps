import { describe, it, expect } from 'vitest'
import { normalizeCommandSpaces, normalizeCommand } from './commandEvaluator'

describe('normalizeCommandSpaces State Scanner (Subhito 5A)', () => {
  it('colapsa espacios y tabs fuera de comillas conservando espacios simples', () => {
    expect(normalizeCommandSpaces('ls   -la\t\t/srv/demo')).toBe('ls -la /srv/demo')
  })

  it('preserva espacios dentro de comillas simples intactos', () => {
    expect(normalizeCommandSpaces("curl  -H  'Header:  Value'")).toBe("curl -H 'Header:  Value'")
  })

  it('preserva espacios dentro de comillas dobles intactos', () => {
    expect(normalizeCommandSpaces('grep  "ERROR  FOUND"  app.log')).toBe('grep "ERROR  FOUND" app.log')
  })

  it('preserva comillas dobles escapadas dentro de comillas dobles', () => {
    expect(normalizeCommandSpaces('echo  "Hello  \\"  World"')).toBe('echo "Hello  \\"  World"')
  })

  it('preserva barras invertidas fuera de comillas', () => {
    expect(normalizeCommandSpaces('find  .  -name  \\*.conf')).toBe('find . -name \\*.conf')
  })

  it('maneja comillas sin cerrar de forma conservadora preservando espacios internos', () => {
    expect(normalizeCommandSpaces('grep  "unclosed  text')).toBe('grep "unclosed  text')
  })

  it('retorna string vacío ante entrada vacía', () => {
    expect(normalizeCommandSpaces('')).toBe('')
  })

  it('retorna un único espacio ante entrada compuesta únicamente por espacios', () => {
    expect(normalizeCommandSpaces('   \t  ')).toBe(' ')
  })

  it('integra normalizeCommand con trim_outer y spaces_outside_quotes', () => {
    const res = normalizeCommand('   grep   "foo  bar"   file.log   ', ['trim_outer', 'spaces_outside_quotes'])
    expect(res).toBe('grep "foo  bar" file.log')
  })

  it('preserva espacios dentro de alternancia de comillas simples y dobles', () => {
    expect(normalizeCommandSpaces("echo  'a  b'  \"c  d\"")).toBe("echo 'a  b' \"c  d\"")
  })

  it('preserva barras invertidas y espacios dentro de comillas dobles', () => {
    expect(normalizeCommandSpaces('printf  "a\\\\ b"   file')).toBe('printf "a\\\\ b" file')
  })
})
