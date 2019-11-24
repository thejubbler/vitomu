import { Component, OnInit, ViewEncapsulation, NgZone, OnDestroy } from '@angular/core';
import { ConvertService } from '../../services/convert/convert.service';
import { ipcRenderer, clipboard } from 'electron';
import { Events } from '../../core/events';
import { Logger } from '../../core/logger';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-convert',
  templateUrl: './convert.component.html',
  styleUrls: ['./convert.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConvertComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private _canConvert: boolean;
   private _isConverting: boolean;
  private _progressPercent : number;
  private _downloadUrl: string;
  
  constructor(private convert: ConvertService, private logger: Logger, private zone: NgZone) { }

  public get canConvert(): boolean {
    return this._canConvert;
  }

  public set canConvert(v: boolean) {
    this._canConvert = v;
  }

  public get progressPercent() : number {
    return this._progressPercent;
  }
  public set progressPercent(v : number) {
    this._progressPercent = v;
  }
  

  public get isConverting(): boolean {
    return this._isConverting;
  }

  public set isConverting(v: boolean) {
    this._isConverting = v;
  }

  public get downloadUrl(): string {
    return this._downloadUrl;
  }

  public set downloadUrl(v: string) {
    this._downloadUrl = v;
  }

  ngOnInit() {
    ipcRenderer.on(Events.windowFocusChangedEvent, () => {
      let clipBoardText: string = clipboard.readText();

      this.zone.run(() => {
        if (clipBoardText && clipBoardText.includes('https://www.youtube.com/watch?v=')) {
          this.canConvert = true;
          this.downloadUrl = clipBoardText;
        } else {
          this.canConvert = false;
        }
      });
    });

    this.subscription = this.convert.convertStatusChanged$.subscribe((isConverting) => this.zone.run(() => this.isConverting = isConverting));
    this.subscription.add(this.convert.convertProgressChanged$.subscribe((progressPercent) => this.zone.run(() => this.progressPercent = progressPercent)));
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public performConvert(){
    let pieces: string[] = this.downloadUrl.split("&");
    let videoId: string = pieces[0].replace("https://www.youtube.com/watch?v=","");
    this.convert.convertAsync(videoId);
  }
}
