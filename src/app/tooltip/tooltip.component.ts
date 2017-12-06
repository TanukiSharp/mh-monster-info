import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent implements OnInit {

    private parentElement: any;

    @ViewChild('root')
    private rootChild: ElementRef;

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit() {

        let parentElement = this.elementRef.nativeElement.parentElement;
        let rootElement = this.rootChild.nativeElement;

        parentElement.onmousemove = function (e: MouseEvent) {

            let x = e.clientX + 10;
            let y = e.clientY + 10;

            if (y + rootElement.offsetHeight > document.body.offsetHeight) {
                y = e.clientY - rootElement.offsetHeight - 10;
            }
            if (x + rootElement.offsetWidth > document.body.offsetWidth) {
                x = e.clientX - rootElement.offsetWidth - 10;
            }

            rootElement.style.left = x + 'px';
            rootElement.style.top = y + 'px';
        };

        parentElement.addEventListener('mouseenter', (ev: Event) => {
            rootElement.classList.remove('root-hidden');
            rootElement.classList.add('root-visible');
        });

        parentElement.addEventListener('mouseleave', (ev: Event) => {
            rootElement.classList.add('root-hidden');
            rootElement.classList.remove('root-visible');
        });
    }
}
