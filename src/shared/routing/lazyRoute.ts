import { lazy, type ComponentType } from "react";

export function lazyRoute<Props = Record<string, never>>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string,
): ComponentType<Props> {
  return lazy(() =>
    factory().then((module) => ({
      default: module[exportName] as ComponentType<Props>,
    })),
  ) as ComponentType<Props>;
}
