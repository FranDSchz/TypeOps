import { describe, it, expect } from 'vitest'
import { validateResponsePresent } from './responseValidation'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, ContentItem } from '../content/types'

describe('validateResponsePresent (Función Pura de Validación de Presencia)', () => {
  const pack = officialPack as ContentPack

  it('valida typing_copy: texto vacío o con solo espacios es inválido', () => {
    const item = pack.items.find((i) => i.kind === 'typing_copy') as ContentItem
    expect(validateResponsePresent(item, '')).toEqual({
      isValid: false,
      errorCode: 'empty_response',
      errorMessage: 'Debés ingresar el texto antes de enviar la respuesta.',
      targetElementId: 'typing-input',
    })
    expect(validateResponsePresent(item, '   ')).toEqual({
      isValid: false,
      errorCode: 'empty_response',
      errorMessage: 'Debés ingresar el texto antes de enviar la respuesta.',
      targetElementId: 'typing-input',
    })
    expect(validateResponsePresent(item, 'ls -la')).toEqual({ isValid: true })
  })

  it('valida command_intention: comando vacío o con solo espacios es inválido', () => {
    const item = pack.items.find((i) => i.kind === 'command_intention') as ContentItem
    expect(validateResponsePresent(item, '')).toEqual({
      isValid: false,
      errorCode: 'empty_response',
      errorMessage: 'Debés escribir un comando antes de enviar.',
      targetElementId: 'command-input',
    })
    expect(validateResponsePresent(item, '    ')).toEqual({
      isValid: false,
      errorCode: 'empty_response',
      errorMessage: 'Debés escribir un comando antes de enviar.',
      targetElementId: 'command-input',
    })
    expect(validateResponsePresent(item, 'tail -n 20 /var/log/auth.log')).toEqual({ isValid: true })
  })

  it('valida open_question: explicación vacía o con solo espacios es inválida', () => {
    const item = pack.items.find((i) => i.kind === 'open_question') as ContentItem
    expect(validateResponsePresent(item, '')).toEqual({
      isValid: false,
      errorCode: 'empty_response',
      errorMessage: 'Debés escribir una explicación antes de enviar.',
      targetElementId: 'open-textarea',
    })
    expect(validateResponsePresent(item, '   \n  ')).toEqual({
      isValid: false,
      errorCode: 'empty_response',
      errorMessage: 'Debés escribir una explicación antes de enviar.',
      targetElementId: 'open-textarea',
    })
    expect(validateResponsePresent(item, 'Analizando los registros de fallas')).toEqual({ isValid: true })
  })

  it('valida exact_question: opción no seleccionada es inválida', () => {
    const item = pack.items.find((i) => i.kind === 'exact_question') as ContentItem
    expect(validateResponsePresent(item, '')).toEqual({
      isValid: false,
      errorCode: 'missing_choice',
      errorMessage: 'Debés seleccionar una opción antes de enviar.',
      targetElementId: 'exact-options-group',
    })
    expect(validateResponsePresent(item, 'opt-1')).toEqual({ isValid: true })
  })

  it('valida decision: requiere selección de decisión y evidencia requerida según el ítem', () => {
    const item = pack.items.find((i) => i.kind === 'decision') as ContentItem
    // Sin decisión
    expect(validateResponsePresent(item, { selectedChoiceIds: [], selectedEvidenceIds: [] })).toEqual({
      isValid: false,
      errorCode: 'missing_choice',
      errorMessage: 'Debés seleccionar una decisión antes de enviar.',
      targetElementId: 'decision-choices-group',
    })

    // Con decisión pero sin evidencia requerida (el ítem tiene requiredEvidenceIds = ['ev-1'])
    expect(validateResponsePresent(item, { selectedChoiceIds: ['ch-1'], selectedEvidenceIds: [] })).toEqual({
      isValid: false,
      errorCode: 'missing_evidence',
      errorMessage: 'Debés seleccionar al menos una evidencia requerida.',
      targetElementId: 'decision-evidence-group',
    })

    // Con decisión y evidencia
    expect(validateResponsePresent(item, { selectedChoiceIds: ['ch-1'], selectedEvidenceIds: ['ev-1'] })).toEqual({
      isValid: true,
    })
  })

  it('valida guided_practice: etapa que requiere intento no puede enviarse vacía', () => {
    const item = pack.items.find((i) => i.kind === 'guided_practice') as ContentItem
    expect(validateResponsePresent(item, { stageId: 'stg-4', responseRaw: '' })).toEqual({
      isValid: false,
      errorCode: 'empty_stage_response',
      errorMessage: 'Esta etapa requiere una respuesta para avanzar. Si no querés responder, usá "Omitir ejercicio".',
      targetElementId: 'guided-input',
    })
    expect(validateResponsePresent(item, { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' })).toEqual({
      isValid: true,
    })
  })
})
