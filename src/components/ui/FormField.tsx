import {cloneElement, isValidElement, type ReactElement, type ReactNode} from 'react'

type FieldControlProps = {
    id?: string
    required?: boolean
    'aria-invalid'?: boolean
    'aria-describedby'?: string
}

type FormFieldProps = {
    /** Visible label text. */
    label: string
    /** `id` of the control; links the `<label>`, hint and error. */
    id: string
    /** Validation message; when set the control gets `aria-invalid="true"`. */
    error?: string | null
    /** Helper text under the control. */
    hint?: ReactNode
    /** Marks the field as required (visual asterisk + `required` on the control). */
    required?: boolean
    /** Extra class on the wrapper (e.g. to span a grid row). */
    className?: string
    /** The single form control (`input`, `select`, `textarea`). */
    children: ReactElement<FieldControlProps>
}

/**
 * Labelled form field (FE-11).
 *
 * Renders `<label htmlFor>`, the control, an optional hint and an inline error. The control
 * receives `id`, `required`, `aria-invalid` and `aria-describedby` pointing at the hint and
 * error texts, so screen readers announce them with the field.
 */
export function FormField({
    label,
    id,
    error,
    hint,
    required = false,
    className,
    children,
}: Readonly<FormFieldProps>) {
    const hintId = hint ? `${id}-hint` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

    const control = isValidElement(children)
        ? cloneElement(children, {
            id,
            required: required || undefined,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
        })
        : children

    return (
        <div className={['form-field', className].filter(Boolean).join(' ')}>
            <label className="form-field-label" htmlFor={id}>
                {label}
                {required && (
                    <span className="form-field-required" aria-hidden="true"> *</span>
                )}
            </label>

            {control}

            {error && (
                <p id={errorId} className="form-field-error">
                    <span aria-hidden="true">!! </span>
                    {error}
                </p>
            )}

            {hint && (
                <p id={hintId} className="form-field-hint">
                    {hint}
                </p>
            )}
        </div>
    )
}
