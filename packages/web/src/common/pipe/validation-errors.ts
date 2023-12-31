import { CustomError } from '@malagu/core';
import { ValidationError } from 'class-validator';

export class ValidationErrors extends CustomError {

    constructor(errors?: ValidationError[]) {
        super(errors === undefined ? undefined : JSON.stringify(errors));
    }

}
