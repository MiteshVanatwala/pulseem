
export interface ValidPassword {
    PasswordLength: Number,
    SpecialChar: RegExpMatchArray | boolean | null,
    UpperChar: RegExpMatchArray | boolean | null,
    LowerChar: RegExpMatchArray | boolean | null,
    NumberChar: RegExpMatchArray | boolean | null,
}