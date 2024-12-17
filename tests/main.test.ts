import { zodRegex } from "../src";
import { describe, expect, test } from 'vitest'
import { z } from "zod";

describe("Numbers in regex", () => {
    const schema = z.object({ hours: z.coerce.number(), minutes: z.coerce.number() })
    const re = /^(?<hours>\d{2}):(?<minutes>\d{2})$/
    const isTime = zodRegex(schema, re)

    describe("VALID", () => {
        test.for([
            { test: "12:34", hours: 12, minutes: 34 },
            { test: "06:45", hours: 6, minutes: 45 }
        ])("$test == $hours hours and $minutes minutes", ({ test, hours, minutes }) => {
            const output = isTime(test)
            expect(output).toEqual({ hours, minutes })
            expect(output?.hours).toBeTypeOf("number")
            expect(output?.minutes).toBeTypeOf("number")
        })
    })
    describe("INVALID", () => {
        test.for([
            [":34", "no hour digits"],
            ["2:34", "only one hour digit"],
            ["123:45", "3 hour digits"],
            ["12:", "no minute digit"],
            ["12:3", "only one minute digit"],
            ["12:345", "three minute digits"],
            ["1234", "no colon"],
        ])("%s fails because %s", ([input]) => {
            expect(isTime(input!)).toBeNull()
        })
    })
})

describe("Multiple regexes fallback", () => {
    const schema = z.object({
        owner: z.string(),
        repo: z.string(),
    })
    const firstRegex = /^https?:\/\/github\.com\/(?<owner>[^\/]+)\/(?<repo>[^\/]+)$/
    const secondRegex = /^(?<owner>[^\/]+)\/(?<repo>[^\/]+)$/
    const isGithubUrl = zodRegex(schema, firstRegex, secondRegex)

    const longUrl = "https://github.com/colinhacks/zod"
    const shortUrl = "colinhacks/zod"
    const output = {
        owner: "colinhacks",
        repo: "zod",
    }

    describe("VALID", () => {
        test(`longUrl ${longUrl} matches`, () => {
            expect(isGithubUrl(longUrl)).toEqual(output)
        })
        test(`shortUrl ${shortUrl} matches`, () => {
            expect(isGithubUrl(shortUrl)).toEqual(output)
        })
    })

    describe("INVALID", () => {
        test.for([
            ["https://github.com/colinhacks", "no repo"],
            ["https://gitlab.com/colinhacks/zod", "gitlab instead of github"],
        ])("%s fails because %s", ([input]) => {
            expect(isGithubUrl(input!)).toBeNull()
        })
    })
})
