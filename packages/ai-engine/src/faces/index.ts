/**
 * Faces - the RNG reveal layer (Bones / Faces run loop).
 */

export type { Face, RevealRole, JumpProfile } from './face';
export { FACES, getFace, revealFaces } from './faces';
export type { ResponseChoice, JumpOutcome, JumpModifier, JumpResult } from './jump-check';
export { resolveJumpCheck } from './jump-check';
