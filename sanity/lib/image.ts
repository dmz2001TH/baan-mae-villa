import urlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from "../env";

/**
 * Image URL helper using urlBuilder from @sanity/image-url.
 * Use: urlFor(image).url() to get the image URL string.
 */
const imageBuilder = urlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
}
