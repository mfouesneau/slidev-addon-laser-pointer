/**
 * Applies CSS variables and a gating class to a root element on behalf of several owners
 * (Slidev renders `global-top.vue` once per slide view). An owner releasing must not wipe
 * what another live owner applied, so the root reflects the first owner that has variables.
 */
export function createVarsApplier(
  root: { style: { setProperty: (k: string, v: string) => void, removeProperty: (k: string) => void }, classList: { add: (c: string) => void, remove: (c: string) => void } },
  activeClass: string,
) {
  const owners = new Map<symbol, Record<string, string> | null>()
  let applied: string[] = []

  function render() {
    for (const name of applied)
      root.style.removeProperty(name)
    applied = []
    root.classList.remove(activeClass)
    const vars = [...owners.values()].find(v => v !== null)
    if (!vars)
      return
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value)
      applied.push(name)
    }
    root.classList.add(activeClass)
  }

  return {
    /** Set (or, with null, clear) this owner's variables. */
    set(owner: symbol, vars: Record<string, string> | null) {
      owners.set(owner, vars)
      render()
    },
    /** Forget this owner; others keep their variables. */
    release(owner: symbol) {
      owners.delete(owner)
      render()
    },
  }
}
