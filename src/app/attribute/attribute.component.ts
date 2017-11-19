import { Component, Input, OnInit } from '@angular/core';
import { Attribute, IAttributeInfo } from '../data-structures/attribute-info';
import { DataLoaderService } from '../data-loader.service';

@Component({
    selector: 'app-attribute',
    templateUrl: './attribute.component.html',
    styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit {

    @Input()
    public attribute: IAttributeInfo;
    @Input()
    public showValues: boolean = true;

    public get displayValue(): string {
        if (this.attribute.value < 0) {
            return '';
        }
        if (this.attribute.value === 100) {
            return 'MAX';
        }
        return this.attribute.value + '%';
    }

    constructor(private dataLoaderService: DataLoaderService) { }

    public getAttributeString() {
        return this.dataLoaderService.attributeToString(this.attribute.type);
    }

    ngOnInit() {
    }
}
