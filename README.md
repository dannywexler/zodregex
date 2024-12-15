## Overview

Parameters:

1. A [zod](https://zod.dev/) schema
1. A Regex with 1 or more named capture groups
1. (Optional) multiple additional fallback Regexes

Returns:

A function that:
- Tests an input string against the regex(es)
- Parses the catpure groups against the zod schema
- Returns:
  - The successfully parsed and **typesafe** matches, or
  - `null` indicating the input string did not match the Regex.

## Quick Start

```ts
const timeSchema = z.object({
    hours: z.coerce.number(),
    minutes: z.coerce.number(),
})
const timeRegex = /^(?<hours>\d{2}):(?<minutes>\d{2})$/
const isTime = zodRegex(timeSchema, timeRegex)

const result = isTime("12:34")
   // result is { hours: 12, minutes: 34 }

const result2 = isTime("123:456")
   // result2 is null, indicating there was no match
```

## Using Regexes the usual way

```ts
// Use the same timeRegex and testString from before
const timeRegex = /^(?<hours>\d{2}):(?<minutes>\d{2})$/
const testString = "12:34"

const match = testString.match(timeRegex)
   // match: RegExpMatchArray | null
if (!match) { return } // make sure we have a match
  // match: RegExpMatchArray
const { groups } = match
     // groups: Record<string, string> | undefined
if (!groups) { return } // make sure we have groups
// groups: Record<string, string>

// We've lost any typesafety of our capture group names here
const { hours, minutes } = groups
// hours and minutes are: string | undefined
if (!hours || !minutes) { return } // make sure we have hours and minutes
// hours and minutes are: string

// Even though we wrote the regex to check that hours and minutes are two digits next to each other, we have to re-parse the values back into numbers
return {
    hours: Number.parseInt(hours),
    minutes: Number.parseInt(minutes)
}
}
```

## Using Regexes with zodregex

```ts
// Create a zod schema
const timeSchema = z.object({
    hours: z.coerce.number(),
    minutes: z.coerce.number(),
})
// create a regex with named capture groups
const timeRegex = /^(?<hours>\d{2}):(?<minutes>\d{2})$/
// pass the zod schema and regex into zodRegex
const isTime = zodRegex(timeSchema, timeRegex)
   // isTime is (input: string) => { hours: number, minutes: number} | null
const testString = "12:34"
const result = isTime(testString)
   // result is { hours: 12, minutes: 34 }
   // Note: result is typesafe, with hours and minutes typed as numbers, matching the zod schema passed in

const invalidTime = "123:456"
const result2 = isTime(testString)
   // result2 is null, indicating there was no match
```

> [!NOTE]
> This example with parsing hours and minutes was chosen just for simplicity of an easy to understand example with parsing numbers. This should not be used in production because it accepts any digits, including `78:90` which aren't valid times. Should prefer using an [actual date parsing library like dayjs](https://day.js.org/docs/en/parse/string-format). As a fallback, can make the zod schema more strict: 
```ts
const timeSchema = z.object({
    hours: z.coerce.number().min(0).max(23), // 24 hour time
    minutes: z.coerce.number().min(0).max(59),
})
```

## Using multiple regexes with zodregex

zodregex can accept multiple regexes

```ts
const schema = /* some zod schema */
const regex1 = /* some Regex */
const regex2 = /* an alternative Regex */
// ...
const regexN = /* another alternative Regex */
const checker = zodRegex(schema, regex1, regex2, ..., regexN)
```

In this case zodregex will try to match the input string against each regex against until it finds a match or has tested all the regexes.

### Keep in mind:

> [!CAUTION]
> It is up to the developer to keep the capture group names in the regex in sync with the keys and values of the zod schema!

Example:
```ts
const timeSchema = z.object({
    hours: z.coerce.number(),
    minutes: z.coerce.number(),
})
const timeRegex = /^(?<hour>\d{2}):(?<minute>\d{2})$/
```
This combination of zod schema and regex will never match any strings, because the regex has named capture groups `hour` and `minute`, which don't match the zod schema keys `hours` and `minutes`. Some unit tests would catch this however.

I haven't found a way to extract the type signature of the matched capture groups of a regex. If anyone knows how, I'd be very interested. That way having out-of-sync zod schemas and regex could be caught at compile-time at the type-level.
