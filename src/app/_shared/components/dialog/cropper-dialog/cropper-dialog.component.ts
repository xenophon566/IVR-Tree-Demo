import { Component, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { CropperComponent } from 'angular-cropperjs';
import { LanguageService, UtilitiesService } from '@core/utils';

/**
 *
 *
 * @export
 * @class CropperDialogComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'cbe-shared-cropper-dialog',
    templateUrl: './cropper-dialog.component.html',
    styleUrls: ['./cropper-dialog.component.scss'],
})
export class CropperDialogComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private nbDialogRef: NbDialogRef<CropperDialogComponent>,
        private utilitiesService: UtilitiesService,
        private languageService: LanguageService
    ) {
        this.DIALOG = this.languageService.getLanguages('DIALOG');
    }

    @ViewChild('angularCropper') public angularCropper: CropperComponent;

    DIALOG: any;

    content = '';

    componentType = '';

    /**
     * config
     *
     * @memberof CropperDialogComponent
     */
    config = {
        viewMode: 2,
        aspectRatio: NaN,
        ready: this.ready.bind(this),
    };

    imageUrl = null;

    imageFiles = null;

    croppedImage = null;

    data = null;

    dataUrl = '';

    ready(data) {
        // image data from event target
        this.data = data;

        // cropped image base64 when image ready
        this.dataUrl = this.angularCropper.cropper
            .getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            })
            .toDataURL('image/jpeg', 1);
    }

    /**
     * crop
     *
     * @param {*} data
     * @memberof CropperDialogComponent
     */
    cropFinish() {
        // cropped image base64 after finish cropped
        this.dataUrl = this.angularCropper.cropper
            .getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            })
            .toDataURL('image/jpeg', 1);

        // cropped image blob
        const blob = this.utilitiesService.base64ToFile(this.dataUrl);

        // cropped image blob URL
        const blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);

        // cropped image
        this.croppedImage = {
            width: this.data.target.width,
            height: this.data.target.height,
            dataUrl: this.dataUrl,
            blob,
            blobUrl,
        };
    }

    /**
     * confirm
     *
     * @memberof CropperDialogComponent
     */
    confirm() {
        this.cropFinish();
        this.nbDialogRef.close({
            action: 'confirm',
            croppedImage: this.croppedImage,
        });
    }

    /**
     * cancel
     *
     * @memberof CropperDialogComponent
     */
    cancel() {
        this.nbDialogRef.close({ action: 'cancel' });
    }

    /**
     * reset
     *
     * @memberof CropperDialogComponent
     */
    reset() {
        this.nbDialogRef.close({ action: 'reset' });
    }

    /**
     * set Aspect Ratio
     *
     * @param {*} ratio
     * @memberof CropperDialogComponent
     */
    setAspectRatio(ratio) {
        this.angularCropper.cropper.setAspectRatio(ratio);
    }

    ngOnInit(): void {
        if (this.componentType === 'CardImage') this.config.aspectRatio = 1 / 1;

        const reader = new FileReader();
        reader.readAsDataURL(this.imageFiles);
        reader.onload = (e) => (this.imageUrl = e.target.result);
    }

    ngOnDestroy(): void {
        this.imageUrl = null;
        this.imageFiles = null;
        this.nbDialogRef = null;
        this.croppedImage = null;
        this.data = null;
        this.dataUrl = null;
    }
}
