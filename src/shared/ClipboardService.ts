export type SizedImageSource = HTMLCanvasElement | ImageBitmap | OffscreenCanvas;

export class ClipboardService {
  static default = new ClipboardService();

  copyImageSource(imageSource: SizedImageSource) {
    const canvas = document.createElement("canvas");
    canvas.width = imageSource.width as number;
    canvas.height = imageSource.height as number;
    const context = canvas.getContext("2d")!;
    context.drawImage(imageSource, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      }
    });
  }
}
