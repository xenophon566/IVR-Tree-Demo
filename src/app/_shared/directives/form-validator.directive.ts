import { Directive, Input } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from "@angular/forms";

export function formControlNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const forbidden = control.value ? (control.value.match(nameRe) !== null ? true : false) : false;
        return !forbidden ? { formValidator: { value: control.value } } : null;
    };
}

@Directive({
    selector: "[cbeFormValidator]",
    providers: [{ provide: NG_VALIDATORS, useExisting: FormValidatorDirective, multi: true }],
})
export class FormValidatorDirective implements Validator {
    constructor() {}

    @Input("cbeFormValidator") formValidator: string;

    validate(control: AbstractControl): { [key: string]: any } {
        return this.formValidator ? formControlNameValidator(new RegExp(this.formValidator, "i"))(control) : null;
    }
}
