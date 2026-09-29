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
export async function promptOptionalPackages(): Promise<OptionalPackage[] | null> {
  const result = await p.multiselect({
    message: 'Select optional packages to include',
    options: OPTIONAL_PACKAGES.map((id) => ({
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
