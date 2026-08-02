/**
 * TypeOps V1 — Content Domain Types
 *
 * Contrato de contenido y tipos de dominio validados.
 * Definidos de acuerdo a docs/TYPEOPS_V1_CONTENT_SCHEMA.md
 */

export type ClaimStatus =
  | 'confirmed'
  | 'preliminary'
  | 'standard_model'
  | 'hypothesis'
  | 'not_applicable'

export type SourceNoteType =
  | 'official_doc'
  | 'course_note'
  | 'tutor_note'
  | 'manual_pilot'
  | 'standard_model'
  | 'competition_info'
  | 'editorial'

export interface SourceNote {
  type: SourceNoteType
  title: string
  reference?: string
  accessedAt?: string
  claimStatus: ClaimStatus
  note: string
}

export type SkillDimension =
  | 'knowledge'
  | 'tool_selection'
  | 'next_action'
  | 'interpretation'
  | 'verification'
  | 'mechanical'

export interface SkillRef {
  skillId: string
  dimension: SkillDimension
}

export type SecurityScope = 'safe_inert' | 'authorized_lab_only' | 'defensive_only'
export type SecurityTarget = 'localhost' | '127.0.0.1' | 'example.test' | 'fictional_files'

export interface SecurityContext {
  scope: SecurityScope
  targets: SecurityTarget[]
  executionAllowed: false
  note?: string
}

export type MechanicalSequenceType = 'character' | 'symbol' | 'bigram' | 'sequence'

export interface MechanicalSequence {
  value: string
  type: MechanicalSequenceType
}

export type HintRevealType = 'concept' | 'tool' | 'structure' | 'syntax'

export interface Hint {
  hintId: string
  level: 1 | 2
  text: string
  reveals: HintRevealType
}

export interface RubricCommonError {
  errorCode: string
  explanation: string
}

export interface Rubric {
  rubricId: string
  essentialElements: string[]
  acceptableAlternatives: string[]
  commonErrors: RubricCommonError[]
  verificationCriterion: string
  doNotInfer: string[]
  shortFeedbackTemplate?: string
}

export interface LearningUnit {
  unitId: string
  title: string
  summary: string
  categories: string[]
  skills: SkillRef[]
  pedagogicalDifficulty: 1 | 2 | 3
  prerequisiteUnitIds: string[]
  guidedPathId?: string
  sourceNotes: SourceNote[]
}

export type GuidedStageType =
  | 'model'
  | 'syntax_breakdown'
  | 'contextual_example'
  | 'guided_exercise'
  | 'unassisted_exercise'
  | 'later_variant'

export interface GuidedCommandAnswerSpec {
  kind: 'command'
  acceptedAlternatives: string[]
  normalization: CommandNormalizationOption[]
  unrecognizedPolicy: 'needs_review'
}

export interface GuidedStage {
  stageId: string
  stageType: GuidedStageType
  title: string
  content: string
  expectedAction?: GuidedCommandAnswerSpec
  advancementCriterion?: string
}

export interface GuidedPath {
  pathId: string
  unitId: string
  title: string
  stages: GuidedStage[]
}

export type ContentItemKind =
  | 'typing_copy'
  | 'command_intention'
  | 'exact_question'
  | 'open_question'
  | 'decision'
  | 'guided_practice'

export type ContentItemMode = 'typing' | 'command' | 'review' | 'guided'

export type CategoryVisibility = 'visible' | 'hidden_when_ready'

export interface MaxResponseLimit {
  lines?: number
  bullets?: number
  characters?: number
}

export interface BaseContentItem {
  itemId: string
  kind: ContentItemKind
  mode: ContentItemMode
  unitIds: string[]
  title: string
  context: string
  task: string
  responseFormat: string
  maxResponse: MaxResponseLimit
  estimatedSeconds: number
  categories: string[]
  skills: SkillRef[]
  difficulty: 1 | 2 | 3
  prerequisiteUnitIds: string[]
  hints: Hint[]
  explanation: string
  variantOf?: string
  categoryVisibility: CategoryVisibility
  securityContext: SecurityContext
  competitionClaim?: ClaimStatus
  mechanicalSequences: MechanicalSequence[]
  sourceNotes: SourceNote[]
  enabled: boolean
}

export type TypingLanguage =
  | 'shell'
  | 'bash'
  | 'path'
  | 'http'
  | 'python'
  | 'sql'
  | 'plain_technical'

export interface TypingCopyItem extends BaseContentItem {
  kind: 'typing_copy'
  mode: 'typing'
  targetText: string
  language: TypingLanguage
  display: 'single_line' | 'multiline'
  whitespacePolicy: 'exact' | 'normalize_line_endings'
  fingerGuideEligible: boolean
  technicalValidationNote: string
}

export interface AcceptedAlternative {
  alternativeId: string
  text: string
  tool: string
  semanticTags: string[]
  explanation: string
}

export type CommandNormalizationOption =
  | 'trim_outer'
  | 'line_endings'
  | 'spaces_outside_quotes'

export interface PatternCheck {
  pattern: string
  description?: string
}

export interface CommandAnswerSpec {
  acceptedAlternatives: AcceptedAlternative[]
  normalization: CommandNormalizationOption[]
  toolChecks: PatternCheck[]
  requiredFragments: string[]
  forbiddenFragments: string[]
  syntaxChecks: PatternCheck[]
}

export interface CommandIntentionItem extends BaseContentItem {
  kind: 'command_intention'
  mode: 'command'
  intent: string
  answerSpec: CommandAnswerSpec
  captureMechanical: boolean
  unrecognizedPolicy: 'needs_review'
}

export type ExactAnswerType =
  | 'single_choice'
  | 'multiple_choice'
  | 'short_exact'
  | 'ordered_steps'

export interface ChoiceOption {
  optionId: string
  text: string
  explanation?: string
}

export interface ExactQuestionItem extends BaseContentItem {
  kind: 'exact_question'
  mode: 'review'
  answerType: ExactAnswerType
  options?: ChoiceOption[]
  acceptedAnswers: string[]
  feedbackByOption?: Record<string, string>
  caseSensitive: boolean
}

export interface OpenQuestionItem extends BaseContentItem {
  kind: 'open_question'
  mode: 'review'
  rubric: Rubric
  reviewPolicy: 'pending_external' | 'optional_self_review'
  captureMechanical: boolean
}

export interface DecisionEvidence {
  evidenceId: string
  text: string
}

export interface DecisionChoice {
  choiceId: string
  text: string
  explanation?: string
}

export interface ConditionalBranch {
  condition: string
  consequence: string
}

export interface DecisionItem extends BaseContentItem {
  kind: 'decision'
  mode: 'review'
  evidence: DecisionEvidence[]
  choices: DecisionChoice[]
  correctChoiceIds: string[]
  requiredEvidenceIds: string[]
  conditionalBranches: ConditionalBranch[]
  rubric?: Rubric
}

export interface GuidedPracticeItem extends BaseContentItem {
  kind: 'guided_practice'
  mode: 'guided'
  unitId: string
  stages: GuidedStage[]
  resumePolicy: 'next_incomplete_stage'
  promotionRule: string
  laterVariantItemId?: string
}

export type ContentItem =
  | TypingCopyItem
  | CommandIntentionItem
  | ExactQuestionItem
  | OpenQuestionItem
  | DecisionItem
  | GuidedPracticeItem

export interface ContentPack {
  schemaVersion: '1.0.0'
  packId: string
  packVersion: string
  title: string
  locale: 'es-AR'
  createdAt: string
  updatedAt: string
  description: string
  sourceNotes: SourceNote[]
  units: LearningUnit[]
  items: ContentItem[]
  guidedPaths: GuidedPath[]
  extensions?: Record<string, unknown>
}

export interface ContentValidationError {
  packId?: string
  itemId?: string
  unitId?: string
  path: string
  code: string
  message: string
}

export type ContentLoadResult =
  | { success: true; pack: ContentPack }
  | { success: false; errors: ContentValidationError[] }
