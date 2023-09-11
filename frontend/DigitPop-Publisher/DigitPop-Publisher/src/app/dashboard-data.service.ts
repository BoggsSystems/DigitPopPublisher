import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getAssets(publisherId: string): Observable<any> {
    const url =
      'https://digitpop-publisher.azurewebsites.net/api/getAssets?code=rcIhaqTtAsakuvsAbIZyV3vDiH-A58zm0hgWAMraRdASAzFuRlaK9w==';
    const body = { publisherId: publisherId };
    console.log(
      'Sending request to get assets for publisher ID: ',
      publisherId
    );
    return this.http.post<any>(url, body).pipe(
      tap((res) => {
        console.log('Received response for assets: ', res);
      }),
      catchError((err) => {
        console.error('Error getting assets: ', err);
        throw err;
      })
    );
  }

  getAsset(assetId: string): Observable<any> {
    const functionKey =
      'i7WrlbSfaf6Nx_TTTsgS_YTxbgjwqhdyIPU8zjd5gxIzAzFuSVV1jw==';
    const url = `https://digitpop-publisher.azurewebsites.net/api/getAsset?code=${functionKey}&assetId=${assetId}`;
    return this.http.get<any>(url);
  }

  createAsset(asset: any, publisherId: string): Observable<any> {
    const url = 'https://digitpop-publisher.azurewebsites.net/api/createAsset';
    const params = new HttpParams()
      .set('code', 'sY2Vqc7IFkkGnY8GPURrpThSU2e5cq9z0E5DZFTl_0O6AzFuAMI75Q==')
      .set('clientId', 'default')
      .set('publisherId', publisherId); // Include the publisherId in the parameters

    const headers = { 'Content-Type': 'application/json' };

    return this.http.post<any>(url, JSON.stringify(asset), { params, headers });
  }

  updateAsset(asset: any): Observable<any> {
    console.log("updateAsset asset : "  + JSON.stringify(asset))
    const url = 'https://digitpop-publisher.azurewebsites.net/api/updateAsset?code=Ml4G8IPC9quNDqzKQsN2YPQ42bX5JG7gp9JJiSxWW0ReAzFu-K9LGg==';

    // Ensure the asset object contains the publisherId from the AuthService
    asset.publisherId = this.authService.publisherId;

    return this.http.post<any>(url, asset).pipe(
      tap((res) => {
        console.log('Received response for asset update: ', res);
      }),
      catchError((err) => {
        console.error('Error updating the asset: ', err);
        throw err;
      })
    );
}


  deleteAsset(assetId: string): Observable<any> {
    const url =
      'https://your-azure-function-app.azurewebsites.net/api/deleteAsset';
    return this.http.delete<any>(`${url}/${assetId}`);
  }

  getAssetTypes(): Observable<any> {
    const url =
      'https://digitpop-publisher.azurewebsites.net/api/GetAssetTypes?code=6ABIx6sZI6OFrpzqjPi-nL1tJoELpUr3nbDD8LGEvsLeAzFugB4b8Q==';
    return this.http.get<any>(url);
  }
}
