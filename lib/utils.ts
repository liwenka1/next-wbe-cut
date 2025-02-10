import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const BASE_URL = "https://bilibili.github.io/WebAV";
export function assetsPrefix<T extends string[] | Record<string, string>>(
	assetsURL: T
): T {
	const prefix = process.env.NODE_ENV === "development" ? "/" : "/WebAV/";
	if (Array.isArray(assetsURL)) {
		return assetsURL.map((url) => `${BASE_URL}${prefix}${url}`) as T;
	}

	return Object.fromEntries(
		Object.entries(assetsURL).map(([k, v]) => [k, `${BASE_URL}${prefix}${v}`])
	) as T;
}

export async function createFileWriter(
	extName = "mp4"
): Promise<FileSystemWritableFileStream> {
	const fileHandle = await window.showSaveFilePicker({
		suggestedName: `WebAV-export-${Date.now()}.${extName}`,
	});
	return fileHandle.createWritable();
}
