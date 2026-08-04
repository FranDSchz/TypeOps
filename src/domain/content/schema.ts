import { z } from 'zod'

/**
 * TypeOps V1 — Zod Content Schema
 *
 * Definición del esquema Zod para validar ContentPacks en runtime.
 * Aplica validaciones estrictas (.strict()) para rechazar campos inesperados.
 */

// ISO 8601 regex simplificado
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

// Semver regex
const semverRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?(?:\+[a-zA-Z0-9.-]+)?$/

export const ClaimStatusSchema = z.enum([
  'confirmed',
  'preliminary',
  'standard_model',
  'hypothesis',
  'not_applicable',
])

export const SourceNoteTypeSchema = z.enum([
  'official_doc',
  'course_note',
  'tutor_note',
  'manual_pilot',
  'standard_model',
  'competition_info',
  'editorial',
])

export const SourceNoteSchema = z
  .object({
    type: SourceNoteTypeSchema,
    title: z.string().min(1, 'title no puede estar vacío'),
    reference: z.string().optional(),
    accessedAt: z.string().regex(isoDateRegex, 'accessedAt debe ser ISO 8601').optional(),
    claimStatus: ClaimStatusSchema,
    note: z.string().min(1, 'note no puede estar vacía'),
  })
  .strict()

export const SkillDimensionSchema = z.enum([
  'knowledge',
  'tool_selection',
  'next_action',
  'interpretation',
  'verification',
  'mechanical',
])

export const SkillRefSchema = z
  .object({
    skillId: z.string().min(1, 'skillId no puede estar vacío'),
    dimension: SkillDimensionSchema,
  })
  .strict()

export const SecurityScopeSchema = z.enum([
  'safe_inert',
  'authorized_lab_only',
  'defensive_only',
])

export const SecurityTargetSchema = z.enum([
  'localhost',
  '127.0.0.1',
  'example.test',
  'fictional_files',
])

export const SecurityContextSchema = z
  .object({
    scope: SecurityScopeSchema,
    targets: z.array(SecurityTargetSchema),
    executionAllowed: z.literal(false, {
      errorMap: () => ({ message: 'executionAllowed debe ser siempre false en V1' }),
    }),
    note: z.string().optional(),
  })
  .strict()

export const MechanicalSequenceTypeSchema = z.enum([
  'character',
  'symbol',
  'bigram',
  'sequence',
])

export const MechanicalSequenceSchema = z
  .object({
    value: z.string().min(1, 'value no puede estar vacío'),
    type: MechanicalSequenceTypeSchema,
  })
  .strict()

export const HintRevealTypeSchema = z.enum([
  'concept',
  'tool',
  'structure',
  'syntax',
])

export const HintSchema = z
  .object({
    hintId: z.string().min(1, 'hintId no puede estar vacío'),
    level: z.union([z.literal(1), z.literal(2)]),
    text: z.string().min(1, 'text de pista no puede estar vacío'),
    reveals: HintRevealTypeSchema,
  })
  .strict()

export const RubricCommonErrorSchema = z
  .object({
    errorCode: z.string().min(1, 'errorCode no puede estar vacío'),
    explanation: z.string().min(1, 'explanation no puede estar vacía'),
  })
  .strict()

export const RubricSchema = z
  .object({
    rubricId: z.string().min(1, 'rubricId no puede estar vacío'),
    essentialElements: z.array(z.string()),
    acceptableAlternatives: z.array(z.string()),
    commonErrors: z.array(RubricCommonErrorSchema),
    verificationCriterion: z.string().min(1, 'verificationCriterion no puede estar vacío'),
    doNotInfer: z.array(z.string()),
    shortFeedbackTemplate: z.string().optional(),
  })
  .strict()

export const LearningUnitSchema = z
  .object({
    unitId: z.string().min(1, 'unitId no puede estar vacío'),
    title: z.string().min(1, 'title no puede estar vacío'),
    summary: z
      .string()
      .min(1, 'summary no puede estar vacío')
      .max(500, 'summary no puede superar los 500 caracteres'),
    categories: z.array(z.string()),
    skills: z.array(SkillRefSchema),
    pedagogicalDifficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    prerequisiteUnitIds: z.array(z.string()),
    guidedPathId: z.string().optional(),
    sourceNotes: z.array(SourceNoteSchema),
  })
  .strict()

export const GuidedStageTypeSchema = z.enum([
  'model',
  'syntax_breakdown',
  'contextual_example',
  'guided_exercise',
  'unassisted_exercise',
  'later_variant',
])

export const GuidedCommandAnswerSpecSchema = z
  .object({
    kind: z.literal('command'),
    acceptedAlternatives: z
      .array(z.string().min(1, 'La alternativa no puede estar vacía'))
      .min(1, 'acceptedAlternatives debe tener al menos 1 elemento')
      .refine((alts) => alts.every((a) => a.trim().length > 0), {
        message: 'Las alternativas no pueden contener únicamente espacios en blanco',
      }),
    normalization: z.array(
      z.enum(['trim_outer', 'line_endings', 'spaces_outside_quotes']),
    ),
    unrecognizedPolicy: z.literal('needs_review'),
  })
  .strict()

export const GuidedStageSchema = z
  .object({
    stageId: z.string().min(1, 'stageId no puede estar vacío'),
    stageType: GuidedStageTypeSchema,
    title: z.string().min(1, 'title no puede estar vacío'),
    content: z.string().min(1, 'content no puede estar vacío'),
    expectedAction: GuidedCommandAnswerSpecSchema.optional(),
    advancementCriterion: z.string().optional(),
  })
  .strict()
  .superRefine((stage, ctx) => {
    const requiresAction = stage.stageType === 'guided_exercise' || stage.stageType === 'unassisted_exercise'
    if (requiresAction && !stage.expectedAction) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La etapa '${stage.stageId}' de tipo '${stage.stageType}' requiere definir expectedAction.`,
        path: ['expectedAction'],
      })
    } else if (!requiresAction && stage.expectedAction) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La etapa '${stage.stageId}' de tipo '${stage.stageType}' no debe definir expectedAction.`,
        path: ['expectedAction'],
      })
    }
  })

export const GuidedPathSchema = z
  .object({
    pathId: z.string().min(1, 'pathId no puede estar vacío'),
    unitId: z.string().min(1, 'unitId no puede estar vacío'),
    title: z.string().min(1, 'title no puede estar vacío'),
    stages: z.array(GuidedStageSchema).min(1, 'GuidedPath debe incluir al menos una etapa'),
  })
  .strict()

export const MaxResponseLimitSchema = z
  .object({
    lines: z.number().int().positive().optional(),
    bullets: z.number().int().positive().optional(),
    characters: z.number().int().positive().optional(),
  })
  .strict()
  .refine(
    (val) => val.lines !== undefined || val.bullets !== undefined || val.characters !== undefined,
    { message: 'maxResponse debe definir al menos una restricción: lines, bullets o characters' },
  )

export const CategoryVisibilitySchema = z.enum(['visible', 'hidden_when_ready'])

// Campos comunes para todo ContentItem
const baseContentItemFields = {
  itemId: z.string().min(1, 'itemId no puede estar vacío'),
  unitIds: z.array(z.string()).min(1, 'unitIds debe tener al menos una unidad'),
  title: z.string().min(1, 'title no puede estar vacío'),
  context: z.string().min(1, 'context no puede estar vacío'),
  task: z.string().min(1, 'task no puede estar vacía'),
  responseFormat: z.string().min(1, 'responseFormat no puede estar vacío'),
  maxResponse: MaxResponseLimitSchema,
  estimatedSeconds: z
    .number()
    .int('estimatedSeconds debe ser un entero')
    .min(15, 'estimatedSeconds debe ser de al menos 15 segundos')
    .max(600, 'estimatedSeconds no puede superar 600 segundos (10 minutos)'),
  categories: z.array(z.string()),
  skills: z.array(SkillRefSchema),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  prerequisiteUnitIds: z.array(z.string()),
  hints: z
    .array(HintSchema)
    .max(2, 'hints no puede superar 2 elementos'),
  explanation: z.string().min(1, 'explanation no puede estar vacía'),
  variantOf: z.string().optional(),
  categoryVisibility: CategoryVisibilitySchema,
  securityContext: SecurityContextSchema,
  competitionClaim: ClaimStatusSchema.optional(),
  mechanicalSequences: z.array(MechanicalSequenceSchema),
  sourceNotes: z.array(SourceNoteSchema),
  enabled: z.boolean(),
}

// 1. typing_copy
export const TypingCopyItemSchema = z
  .object({
    ...baseContentItemFields,
    kind: z.literal('typing_copy'),
    mode: z.literal('typing'),
    targetText: z.string().min(1, 'targetText no puede estar vacío'),
    language: z.enum(['shell', 'bash', 'path', 'http', 'python', 'sql', 'plain_technical']),
    display: z.enum(['single_line', 'multiline']),
    whitespacePolicy: z.enum(['exact', 'normalize_line_endings']),
    fingerGuideEligible: z.boolean(),
    technicalValidationNote: z.string().min(1, 'technicalValidationNote no puede estar vacía'),
  })
  .strict()

// 2. command_intention
export const AcceptedAlternativeSchema = z
  .object({
    alternativeId: z.string().min(1, 'alternativeId no puede estar vacío'),
    text: z.string().min(1, 'text no puede estar vacío'),
    tool: z.string().min(1, 'tool no puede estar vacío'),
    semanticTags: z.array(z.string()),
    explanation: z.string().min(1, 'explanation no puede estar vacía'),
  })
  .strict()

export const PatternCheckSchema = z
  .object({
    pattern: z.string().min(1, 'pattern no puede estar vacío'),
    description: z.string().optional(),
  })
  .strict()

export const CommandAnswerSpecSchema = z
  .object({
    acceptedAlternatives: z
      .array(AcceptedAlternativeSchema)
      .min(1, 'acceptedAlternatives debe tener al menos 1 elemento')
      .max(8, 'acceptedAlternatives no puede superar 8 elementos'),
    normalization: z.array(
      z.enum(['trim_outer', 'line_endings', 'spaces_outside_quotes']),
    ),
    toolChecks: z.array(PatternCheckSchema),
    requiredFragments: z.array(z.string()),
    forbiddenFragments: z.array(z.string()),
    syntaxChecks: z.array(PatternCheckSchema),
  })
  .strict()

export const CommandIntentionItemSchema = z
  .object({
    ...baseContentItemFields,
    kind: z.literal('command_intention'),
    mode: z.literal('command'),
    intent: z.string().min(1, 'intent no puede estar vacío'),
    answerSpec: CommandAnswerSpecSchema,
    captureMechanical: z.boolean(),
    unrecognizedPolicy: z.literal('needs_review'),
  })
  .strict()

// 3. exact_question
export const ChoiceOptionSchema = z
  .object({
    optionId: z.string().min(1, 'optionId no puede estar vacío'),
    text: z.string().min(1, 'text no puede estar vacío'),
    explanation: z.string().optional(),
  })
  .strict()

export const ExactQuestionItemSchema = z
  .object({
    ...baseContentItemFields,
    kind: z.literal('exact_question'),
    mode: z.literal('review'),
    answerType: z.enum(['single_choice', 'multiple_choice', 'short_exact', 'ordered_steps']),
    options: z.array(ChoiceOptionSchema).optional(),
    acceptedAnswers: z.array(z.string()),
    feedbackByOption: z.record(z.string(), z.string()).optional(),
    caseSensitive: z.boolean(),
  })
  .strict()

// 4. open_question
export const OpenQuestionItemSchema = z
  .object({
    ...baseContentItemFields,
    kind: z.literal('open_question'),
    mode: z.literal('review'),
    rubric: RubricSchema,
    reviewPolicy: z.enum(['pending_external', 'optional_self_review']),
    captureMechanical: z.boolean(),
  })
  .strict()

// 5. decision
export const DecisionEvidenceSchema = z
  .object({
    evidenceId: z.string().min(1, 'evidenceId no puede estar vacío'),
    text: z.string().min(1, 'text no puede estar vacío'),
  })
  .strict()

export const DecisionChoiceSchema = z
  .object({
    choiceId: z.string().min(1, 'choiceId no puede estar vacío'),
    text: z.string().min(1, 'text no puede estar vacío'),
    explanation: z.string().optional(),
  })
  .strict()

export const ConditionalBranchSchema = z
  .object({
    condition: z.string().min(1, 'condition no puede estar vacía'),
    consequence: z.string().min(1, 'consequence no puede estar vacía'),
  })
  .strict()

export const DecisionItemSchema = z
  .object({
    ...baseContentItemFields,
    kind: z.literal('decision'),
    mode: z.literal('review'),
    evidence: z.array(DecisionEvidenceSchema),
    choices: z.array(DecisionChoiceSchema),
    correctChoiceIds: z.array(z.string()).min(1, 'correctChoiceIds debe incluir al menos una opción correcta'),
    requiredEvidenceIds: z.array(z.string()),
    conditionalBranches: z
      .array(ConditionalBranchSchema)
      .max(2, 'conditionalBranches no puede tener más de 2 condiciones'),
    rubric: RubricSchema.optional(),
  })
  .strict()

// 6. guided_practice
export const GuidedPracticeItemSchema = z
  .object({
    ...baseContentItemFields,
    kind: z.literal('guided_practice'),
    mode: z.literal('guided'),
    unitId: z.string().min(1, 'unitId no puede estar vacío'),
    guidedPathId: z.string().optional(),
    stages: z.array(GuidedStageSchema).min(1, 'stages debe tener al menos una etapa'),
    resumePolicy: z.literal('next_incomplete_stage'),
    promotionRule: z.string().min(1, 'promotionRule no puede estar vacía'),
    laterVariantItemId: z.string().optional(),
  })
  .strict()

// Unión discriminada de ítems de contenido
export const ContentItemSchema = z.discriminatedUnion('kind', [
  TypingCopyItemSchema,
  CommandIntentionItemSchema,
  ExactQuestionItemSchema,
  OpenQuestionItemSchema,
  DecisionItemSchema,
  GuidedPracticeItemSchema,
])

// Schema raíz de ContentPack
export const ContentPackSchema = z
  .object({
    schemaVersion: z.string().min(1, 'schemaVersion no puede estar vacío'),
    packId: z.string().min(1, 'packId no puede estar vacío'),
    packVersion: z.string().regex(semverRegex, 'packVersion debe ser un semver válido (ej. 1.0.0)'),
    title: z.string().min(1, 'title no puede estar vacío'),
    locale: z.literal('es-AR'),
    createdAt: z.string().regex(isoDateRegex, 'createdAt debe ser una fecha ISO 8601 válida'),
    updatedAt: z.string().regex(isoDateRegex, 'updatedAt debe ser una fecha ISO 8601 válida'),
    description: z.string().min(1, 'description no puede estar vacía'),
    sourceNotes: z.array(SourceNoteSchema),
    units: z.array(LearningUnitSchema),
    items: z.array(ContentItemSchema),
    guidedPaths: z.array(GuidedPathSchema),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
