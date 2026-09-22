import { z } from 'zod';
import type { FinickyConfig } from '@browse-router/shared';

/**
 * Zod schema for a parsed FinickyConfig. We accept the JS source as text from
 * the editor and need to validate structure before persisting. We do NOT
 * execute the JS here — that happens in the sandbox evaluator.
 *
 * The schema intentionally matches Finicky v4's config shape so users can
 * copy desktop config and only adjust browser ids.
 */
export const UrlPatternSchema = z.union([z.string().min(1), z.instanceof(RegExp)]);

export const RewriteRuleSchema = z.object({
  match: z.union([UrlPatternSchema, z.array(UrlPatternSchema).min(1)]),
  url: z.union([z.string(), z.function()]),
});

export const HandlerSchema = z.object({
  match: z.union([UrlPatternSchema, z.array(UrlPatternSchema).min(1)]),
  browser: z.union([z.string().min(1), z.function()]),
});

export const FinickyConfigSchema = z.object({
  defaultBrowser: z.string().min(1),
  rewrite: z.array(RewriteRuleSchema).optional(),
  handlers: z.array(HandlerSchema).optional(),
});

/**
 * Validate a user config against the schema. Returns a typed result.
 *
 * Note: this only validates structure, not function bodies. Functions are
 * validated by the sandbox when the config is actually evaluated.
 */
export function validateConfig(input: unknown): z.SafeParseReturnType<unknown, FinickyConfig> {
  return FinickyConfigSchema.safeParse(input) as z.SafeParseReturnType<unknown, FinickyConfig>;
}
