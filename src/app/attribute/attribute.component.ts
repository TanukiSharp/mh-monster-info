import { Component, Input, OnInit } from '@angular/core';
import { Attribute, IAttributeInfo } from '../data-structures/attribute-info';
import { DataLoaderService } from '../data-loader.service';
import { LanguageService } from '../language.service';

@Component({
    selector: 'app-attribute',
    templateUrl: './attribute.component.html',
    styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit {

    @Input()
    public attribute: IAttributeInfo | undefined;
    @Input()
    public showValues = true;

    public get displayValue(): string {

        if (!this.attribute) {
            return '';
        }

        if (this.attribute.value < 0) {
            return '';
        }
        if (this.attribute.value === 100) {
            return 'MAX';
        }
        return this.attribute.value + '%';
    }

    constructor(
        private dataLoaderService: DataLoaderService,
        private langugeService: LanguageService,
    ) {

    }

    public getAttributeString() {
        if (!this.attribute) {
            return '';
        }
        const key: string = this.dataLoaderService.attributeToTranslationKey(this.attribute.type);
        return this.langugeService.translate(key);
    }

    ngOnInit() {
    }
}
