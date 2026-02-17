import { defineType, defineField, defineArrayMember } from "sanity";

export const villaType = defineType({
  name: "villa",
  title: "Villa Listing",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Villa Name",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: 'e.g. "Pratumnak Hill"',
    }),
    defineField({
      name: "price",
      title: "Price (THB)",
      type: "number",
    }),
    defineField({
      name: "bedrooms",
      title: "Bedrooms",
      type: "number",
    }),
    defineField({
      name: "bathrooms",
      title: "Bathrooms",
      type: "number",
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "isFeatured",
      title: "Show on Home Page?",
      type: "boolean",
    }),
  ],
});
