import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardDataService } from '../dashboard-data.service';
import { Asset } from '../models/asset.model';
import { AssetType } from '../models/asset-type.model';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog-component/confirm-dialog-component.component';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'asset-edit-wizard',
  templateUrl: './asset-edit.component.html',
  styleUrls: ['./asset-edit.component.css'],
})
export class AssetEditComponent implements AfterViewInit {
  detailsFormGroup: FormGroup = new FormGroup({});
  typeFormGroup: FormGroup = new FormGroup({});
  priceFormGroup: FormGroup = new FormGroup({});
  previewFormGroup: FormGroup = new FormGroup({}); // Added previewFormGroup property
  assetTypes: AssetType[] = [];
  assetId: string;
  asset: Asset;
  selectedAssetType?: AssetType; // Added selectedAssetType property
  public assetError: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private dashboardDataService: DashboardDataService,
    private authService: AuthService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {}
  ngAfterViewInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.assetId = params.get('id');
      if (this.assetId) {
        forkJoin({
          assetData: this.dashboardDataService.getAsset(this.assetId),
          assetTypes: this.dashboardDataService.getAssetTypes(),
        }).subscribe({
          next: ({ assetData, assetTypes }) => {
            this.asset = assetData;
            this.assetTypes = assetTypes;
            this.initializeFormGroups(assetData);
          },
          error: (err) => {
            this.assetError = true; // set the assetError flag to true when there's an error
            console.error('An error occurred while fetching asset data:', err);
          },
        });
      }
    });
  }

  private fetchAssetData(assetId: string): void {
    this.dashboardDataService.getAsset(assetId).subscribe((assetData) => {
      this.asset = assetData;
      console.log('Retrieved asset:', this.asset); // <-- This line prints the asset data
      this.initializeFormGroups(assetData);
    });
  }

  private fetchAssetTypes(): void {
    this.dashboardDataService.getAssetTypes().subscribe(
      (types: AssetType[]) => (this.assetTypes = types),
      (error) => console.error(error)
    );
  }

  private initializeFormGroups(assetData: Asset): void {
    this.detailsFormGroup = this._formBuilder.group({
      name: [assetData.name, Validators.required],
      description: [assetData.description, Validators.required],
    });

    this.typeFormGroup = this._formBuilder.group({
      assetType: [assetData.assetType.assetType, Validators.required],
    });

    this.priceFormGroup = this._formBuilder.group({
      prices: this._formBuilder.array(
        this.asset.prices.map((price) =>
          this._formBuilder.group({
            accessType: [price.accessType, Validators.required],
            price: [price.price, [Validators.required, Validators.min(0)]],
          })
        )
      ),
    });

    // Initialize selectedAssetType
    this.selectedAssetType = this.assetTypes.find(
      (type) => type.assetType === assetData.assetType.assetType
    );
  }

  confirmCancel() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to cancel editing the asset?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigateByUrl('/dashboard');
      }
    });
  }

  get pricesFormArray(): FormArray {
    return this.priceFormGroup.get('prices') as FormArray;
  }

  createPriceFormGroup(): FormGroup {
    return this._formBuilder.group({
      accessType: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  addPricePoint() {
    (this.priceFormGroup.get('prices') as FormArray).push(
      this.createPriceFormGroup()
    );
    this.cdr.markForCheck();
  }

  removePricePoint(index: number) {
    (this.priceFormGroup.get('prices') as FormArray).removeAt(index);
    this.cdr.markForCheck();
  }

  updateAsset() {
    if (this.asset) {
      // Update asset object from form group values
      this.asset.name = this.detailsFormGroup.get('name')?.value;
      this.asset.description = this.detailsFormGroup.get('description')?.value;

      const selectedTypeName = this.typeFormGroup.get('assetType')?.value;
      this.asset.assetType = this.assetTypes.find(
        (type) => type.assetType === selectedTypeName
      );

      this.asset.prices = this.priceFormGroup.get('prices')?.value;

      // Send the updated asset to the server
      this.dashboardDataService.updateAsset(this.asset).subscribe(
        (response) => {
          this.toastr.success('Asset was successfully updated', 'Success');
        },
        (error) => {
          this.toastr.error('There was an error updating the asset', 'Error');
        }
      );
    }
  }

  onAssetTypeChange(typeName: string) {
    console.log('Asset type changed:', typeName); // <-- Debugging line
    this.selectedAssetType = this.assetTypes.find(
      (type) => type.assetType === typeName
    );
  }

  get selectedAssetTypeValue(): AssetType | undefined {
    const selectedAssetTypeName = this.typeFormGroup.get('assetType')?.value;
    return this.assetTypes.find(
      (assetType) => assetType.assetType === selectedAssetTypeName
    );
  }
}
