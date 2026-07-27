/**
 * sanitizeImageUrl: takes an image URL as input and returns the same URL if it is not an SVG image, or undefined if it is an SVG image or if the input is null or undefined.
 * Summary: This function checks if the provided URL is an SVG image by looking for the ".svg" substring in a case-insensitive manner. If the URL is an SVG image, it returns undefined; otherwise, it returns the original URL. If the input URL is null or undefined, it also returns undefined.
 * Steps:
 * - Check if the input URL is null or undefined. If it is, return undefined.
 * - Convert the URL to lowercase and check if it contains the substring ".svg".
 * - If the URL contains ".svg", return undefined.
 * - If the URL does not contain ".svg", return the original URL.
 * @param url - The image URL to be sanitized, which can be a string, null, or undefined.
 * @returns - A string representing the sanitized image URL, or undefined if the input is null, undefined, or an SVG image.
 */
export function sanitizeImageUrl(url?: string | null): string | undefined {
	if (!url) return undefined;

	// Check if the URL is an SVG image and return undefined if it is
	if (url.toLocaleLowerCase().includes(".svg")) {
		return undefined;
	}

	// If the URL is not an SVG image, return the original URL
	return url;

}
