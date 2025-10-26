class VideoPreloader {
  private preloadQueue: string[] = [];
  private preloadedVideos: Map<string, HTMLVideoElement> = new Map();
  private currentlyPreloading: Set<string> = new Set();
  private maxConcurrentPreloads = 4;

  preloadVideos(urls: string[]) {
    urls.forEach(url => {
      if (!this.preloadedVideos.has(url) && !this.currentlyPreloading.has(url)) {
        this.preloadQueue.push(url);
      }
    });
    this.processQueue();
  }

  private async processQueue() {
    while (
      this.preloadQueue.length > 0 &&
      this.currentlyPreloading.size < this.maxConcurrentPreloads
    ) {
      const url = this.preloadQueue.shift();
      if (!url) continue;

      this.currentlyPreloading.add(url);
      await this.preloadVideo(url);
      this.currentlyPreloading.delete(url);
    }
  }

  private preloadVideo(url: string): Promise<void> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;

      const onCanPlay = () => {
        this.preloadedVideos.set(url, video);
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', onCanPlay);
        video.removeEventListener('error', onError);
      };

      video.addEventListener('canplaythrough', onCanPlay);
      video.addEventListener('error', onError);

      video.src = url;
      video.load();
    });
  }

  isPreloaded(url: string): boolean {
    return this.preloadedVideos.has(url);
  }

  getPreloadedVideo(url: string): HTMLVideoElement | undefined {
    return this.preloadedVideos.get(url);
  }
}

export const videoPreloader = new VideoPreloader();
