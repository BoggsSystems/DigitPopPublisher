import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardDataService } from '../dashboard-data.service';
import { Observable, startWith } from 'rxjs';
import { Asset } from '../models/asset.model';
import { AssetType } from '../models/asset-type.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog-component/confirm-dialog-component.component';

@Component({
  selector: 'asset-creation-wizard',
  templateUrl: './asset-creation-wizard.component.html',
  styleUrls: ['./asset-creation-wizard.component.css'],
})
export class AssetCreationComponent implements OnInit {
  detailsFormGroup: FormGroup = new FormGroup({});
  typeFormGroup: FormGroup = new FormGroup({});
  priceFormGroup: FormGroup = new FormGroup({});
  previewFormGroup: FormGroup = new FormGroup({});
  assetTypes: AssetType[] = [];

  selectedAssetType?: AssetType;

  asset: Asset = {
    name: '',
    description: '',
    assetType: {
      accessTypes: [],
      assetType: '',
      baseRate: 0 // Initialize as 0
      ,
      id: ''
    },
    prices: [],
    popCoinsRedeemed: 0,
    earnings: 0,
    id: '',
    isActive: false
  };


  constructor(
    private _formBuilder: FormBuilder,
    private dashboardDataService: DashboardDataService,
    private authService: AuthService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.detailsFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.typeFormGroup = this._formBuilder.group({
      assetType: ['', Validators.required],
    });

    this.dashboardDataService.getAssetTypes().subscribe(
      (types: AssetType[]) => (this.assetTypes = types),
      (error) => console.error(error)
    );

    this.priceFormGroup = this._formBuilder.group({
      prices: this._formBuilder.array([this.createPriceFormGroup()]),
    });

    this.previewFormGroup = this._formBuilder.group({
      preview: [''],
    });

    this.detailsFormGroup.valueChanges.subscribe(val => {
      this.asset.name = val.name;
      this.asset.description = val.description;
    });

    this.typeFormGroup.valueChanges.subscribe(val => {
      const selectedType = this.assetTypes.find(type => type.assetType === val.assetType);
      this.asset.assetType = selectedType ? selectedType : this.asset.assetType;
    });

    this.priceFormGroup.valueChanges.subscribe(val => {
      this.asset.prices = val.prices;
    });

  }

  confirmCancel() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to cancel the creation of the asset?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigateByUrl('/dashboard');
      } else {
        // User clicked 'No' or clicked outside the dialog
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
  }

  removePricePoint(index: number) {
    (this.priceFormGroup.get('prices') as FormArray).removeAt(index);
  }

  publishAsset() {
    const asset: Asset = {
      name: this.detailsFormGroup.get('name')?.value,
      description: this.detailsFormGroup.get('description')?.value,
      assetType: this.typeFormGroup.get('assetType')?.value,
      prices: this.priceFormGroup.get('prices')?.value,
      popCoinsRedeemed: 0,
      earnings: 0,
      id: '',
      isActive: false
    };

    if (asset !== null) {
      console.log("Publisher ID: " + this.authService.publisherId);
      this.dashboardDataService.createAsset(asset, this.authService.publisherId as string).subscribe(
        (response) => {
          // Handle response
          this.toastr.success('Asset was successfully created', 'Success');
        },
        (error) => {
          this.toastr.error('There was an error creating the asset', 'Error');
        }
      );
    }
  }

  onAssetTypeChange(typeName: string) {
    this.selectedAssetType = this.assetTypes.find(type => type.assetType === typeName);
  }


  get selectedAssetTypeValue(): AssetType | undefined {
    const selectedAssetTypeName = this.typeFormGroup.get('assetType')?.value;
    return this.assetTypes.find(assetType => assetType.assetType === selectedAssetTypeName);
  }
}
