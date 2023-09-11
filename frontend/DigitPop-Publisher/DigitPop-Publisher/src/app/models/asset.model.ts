// in asset.model.ts
import { AssetType } from './asset-type.model';
import { PricePoint } from './price-point.model';

export interface Asset {
  id: string;
  isActive: boolean;
  name: string;
  description: string;
  assetType: AssetType;
  prices: PricePoint[];
  popCoinsRedeemed: number;
  earnings: number;
}
