import * as p from '@clack/prompts'
import {
  OPTIONAL_PACKAGE_META,
  OPTIONAL_PACKAGES,
  type OptionalPackage,
} from '../packages.ts'

/**
 * Interactive multiselect for optional packages.
 * Returns selected ids, or null if the user cancels.
 */
export async function promptOptionalPackages(
  options: { exclude?: ReadonlySet<string>; message?: string } = {}
): Promise<OptionalPackage[] | null> {
  const { exclude, message = 'Select optional packages to include' } = options
  const available = OPTIONAL_PACKAGES.filter((id) => !exclude?.has(id))
  if (available.length === 0) {
    p.log.warn('All optional packages are already installed.')
    return []
  }

  const result = await p.multiselect({
    message,
    options: available.map((id) => ({
      value: id,
      label: OPTIONAL_PACKAGE_META[id].label,
    })),
    required: false,
  })

  if (p.isCancel(result)) {
    p.cancel('Cancelled.')
    return null
  }

  return result as OptionalPackage[]
}
