import React from 'react'
import { render, screen } from "@testing-library/react"
import MyComponent from "./AuthProvider"
import {describe, it, expect} from "vitest"

describe("App", () => {
    it("Renders login persistence", () => {
        render(<MyComponent/>)
    })

    it("Renders auth")
}
)