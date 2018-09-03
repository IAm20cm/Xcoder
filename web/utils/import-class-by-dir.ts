import { normalize, extname } from 'path';

export type Constructor<T = any> = new (...args: any[]) => T;

export function importClassesFromDirectories(
  directories: string[],
  formats = ['.js', '.ts'],
): Constructor[] {
  const loadFileClasses = function (
    exported: any,
    allLoaded: Constructor[],
  ): Constructor[] {
    if (exported instanceof Function) {
      allLoaded.push(exported);
    } else if (exported instanceof Array) {
      exported.forEach((i: any) => loadFileClasses(i, allLoaded));
    } else if (exported instanceof Object || typeof exported === 'object') {
      Object.keys(exported).forEach((key) =>
        loadFileClasses(exported[key], allLoaded),
      );
    }

    return allLoaded;
  };

  const allFiles = directories.reduce((allDirs, dir) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return allDirs.concat(require('glob').sync(normalize(dir)));
  }, [] as string[]);

  const dirs = allFiles
    .filter((file) => {
      const dtsExtension = file.substring(file.length - 5, file.length);
      return formats.indexOf(extname(file)) !== -1 && dtsExtension !== '.d.ts';
    })
    .map((file) => {
      return require(file);
    });

  return loadFileClasses(dirs, []);
}
