import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardDataService } from '../dashboard-data.service';
import { PublisherService } from '../publisher.service';
import { Asset } from '../models/asset.model';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SpinnerService } from '../spinner.service';
import { ConfirmDialogComponent } from '../confirm-dialog-component/confirm-dialog-component.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'description',
    'assetType',
    'prices',
    'allTimeSales',
    'todaySales',
    'weekSales',
    'monthSales',
    'allTimeRevenue',
    'todayRevenue',
    'weekRevenue',
    'monthRevenue',
    'actions',
  ];
  assets = new MatTableDataSource<Asset>([]);
  loading: boolean = false;
  serverResponded: boolean = false;

  constructor(
    private dialog: MatDialog,
    private dashboardDataService: DashboardDataService,
    private publisherService: PublisherService,
    private authService: AuthService,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private spinnerService: SpinnerService,
    private toastr: ToastrService
  ) {
    this.spinnerService.loading$.subscribe((state) => {
      this.loading = state;
    });

    this.matIconRegistry.addSvgIcon(
      'video_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/video_icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'audio_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/audio_icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'news_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/news_icon.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'game_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/game_icon.svg'
      )
    );
  }

  ngOnInit() {
    const publisherId = this.authService.publisherId;

    if (publisherId !== null) {
      this.dashboardDataService.getAssets(publisherId).subscribe(
        (assets) => {
          this.publisherService.fetchPublisherAnalytics(publisherId).subscribe(
            (analytics) => {
              assets.forEach((asset: { id: string | number }) => {
                if (analytics.assetAnalytics[asset.id]) {
                  Object.assign(asset, analytics.assetAnalytics[asset.id]);
                }
              });
              this.assets.data = assets;
              this.serverResponded = true;
            },
            (err) => {
              console.error('Error fetching analytics: ', err);
            }
          );
        },
        (err) => {
          console.error('Error fetching assets: ', err);
        }
      );
    } else {
      console.warn('Publisher ID is null');
    }
  }

  copyEmbedCodeToClipboard(assetId: string) {
    const script = `
    <script>
        (function() {
            // Include the DigitPop lib first
            var s = document.createElement('script');
            s.src = 'https://digitpopstorage.blob.core.windows.net/configuration/digitPop.js'; // Provide the path to your DigitPop js lib
            document.body.appendChild(s);

            s.onload = function() {
                DigitPop.injectButton('${assetId}');
            }
        })();
    </script>`;

    const textArea = document.createElement('textarea');
    textArea.value = script;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    this.toastr.success('Embed code copied to clipboard! Paste it into your website'); // Updated to use ToastrService
  }

  startTour() {
    // Add the steps for your UI tour
  }

  editAsset(assetId: string) {
    this.router.navigateByUrl('/asset-edit/' + assetId);
  }

  deleteAsset(assetId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: 'Do you confirm the deletion of this asset?',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const asset = this.assets.data.find((asset) => asset.id === assetId);
        if (asset) {
          asset.isActive = false; // set isActive to false to represent 'deletion'
          this.dashboardDataService.updateAsset(asset).subscribe(
            (response) => {
              this.toastr.success('Asset deactivated successfully!');  // Updated to use ToastrService
              // refresh or remove the asset from assets list
              this.assets.data = this.assets.data.filter(
                (asset) => asset.id !== assetId
              );
            },
            (error) => {
              console.error(
                'Error occurred while deactivating the asset: ',
                error
              );
              this.toastr.error('Failed to deactivate the asset!');
            }
          );
        }
      }
    });
  }

  openAssetCreationDialog() {
    this.router.navigateByUrl('/asset-creation-wizard');
  }

  getTotalPopCoinsRedeemed() {
    return this.assets.data
      .map((t) => t.popCoinsRedeemed)
      .reduce((acc, value) => acc + value, 0);
  }

  getTotalEarnings() {
    return this.assets.data
      .map((t) => t.earnings)
      .reduce((acc, value) => acc + value, 0);
  }
}
