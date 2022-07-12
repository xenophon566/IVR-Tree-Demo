import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "separator",
})
export class SeparatorPipe implements PipeTransform {
    transform(value: number | string): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
