import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import Viewer from 'viewerjs';
import { ImageViewerService } from '@core/services/image-viewer.service';
import { TaskFile } from '@core/models/task.model';
import { formatFileSize } from '@core/utils/file.utils';

/**
 * ImageViewer — mounted once at the app root (app.html), driven by
 * {@link ImageViewerService}. Wraps Viewer.js: renders a hidden `<img>` per
 * file (each carrying its metadata as `data-*` attributes, since Viewer.js's
 * title renderer only receives the raw `<img>` element) and hands that list
 * to a `Viewer` instance, which builds and manages its own overlay DOM.
 */
@Component({
  selector: 'app-image-viewer',
  standalone: true,
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss',
  // Viewer.js appends its overlay as a sibling, outside this component's own
  // template — Angular's default emulated encapsulation wouldn't let our
  // .viewer-download rule (image-viewer.scss) reach it. Same pattern as
  // TaskModal/Avatar elsewhere in this project.
  encapsulation: ViewEncapsulation.None,
})
export class ImageViewer {
  private service = inject(ImageViewerService);
  private files = this.service.files;

  private gallery = viewChild<ElementRef<HTMLElement>>('gallery');
  private viewer: Viewer | null = null;
  /** Index of the currently-shown image, kept in sync via Viewer.js's `viewed` event. */
  private currentIndex = 0;

  constructor() {
    effect(() => {
      const galleryEl = this.gallery()?.nativeElement;
      if (this.service.isOpen() && galleryEl) {
        this.createViewer(galleryEl);
      }
    });

    inject(DestroyRef).onDestroy(() => this.viewer?.destroy());
  }

  private createViewer(container: HTMLElement): void {
    this.viewer?.destroy();
    this.currentIndex = this.service.initialIndex();
    container.replaceChildren(...this.buildGalleryImages());

    this.viewer = new Viewer(container, {
      initialViewIndex: this.currentIndex,
      // Viewer.js renders each image on an internal <img> copy and only
      // carries over attributes listed here (its own default list doesn't
      // include data-* at all) — without this, renderTitle() sees `undefined`
      // for name/type/size instead of what buildGalleryImage() set.
      inheritedAttributes: ['data-filename', 'data-filetype', 'data-filesize'],
      viewed: (event) => (this.currentIndex = (event as CustomEvent).detail.index),
      hidden: () => this.onHidden(),
      title: (image) => this.renderTitle(image),
      toolbar: this.buildToolbar(),
    });
    // Construction alone only builds the (hidden) viewer — initialViewIndex
    // is just the default view() falls back to, it doesn't open anything
    // by itself. view() both shows the viewer and jumps to that index.
    this.viewer.view(this.currentIndex);
  }

  /** One real `<img>` per file, metadata stashed as data-* for {@link renderTitle}. */
  private buildGalleryImages(): HTMLImageElement[] {
    return this.files().map((file) => this.buildGalleryImage(file));
  }

  private buildGalleryImage(file: TaskFile): HTMLImageElement {
    const img = document.createElement('img');
    img.src = file.data;
    img.alt = file.name;
    img.dataset['filename'] = file.name;
    img.dataset['filetype'] = file.type;
    img.dataset['filesize'] = String(file.size);
    return img;
  }

  private onHidden(): void {
    this.viewer?.destroy();
    this.viewer = null;
    this.service.close();
  }

  /** Filename • type • size, read back from the `data-*` attributes set in the template. */
  private renderTitle(image: HTMLImageElement): string {
    const { filename, filetype, filesize } = image.dataset;
    return `${filename} • ${filetype} • ${formatFileSize(Number(filesize))}`;
  }

  private buildToolbar(): Viewer.ToolbarOptions {
    return {
      zoomIn: true,
      zoomOut: true,
      oneToOne: true,
      reset: true,
      prev: true,
      play: true,
      next: true,
      rotateLeft: true,
      rotateRight: true,
      flipHorizontal: true,
      flipVertical: true,
      download: { show: true, click: () => this.downloadCurrent() },
    };
  }

  private downloadCurrent(): void {
    const file = this.files()[this.currentIndex];
    if (!file) return;
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
  }
}
