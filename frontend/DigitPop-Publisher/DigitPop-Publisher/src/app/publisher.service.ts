import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {

  private azureFunctionUrl = 'https://digitpop-publisher.azurewebsites.net/api';  // Replace with your Azure Function App URL
  private azureFunctionKey = 'U_OHVq8aiR5Py3kO1zgGSjdmsiDMD1FNtx5AKnznSiN6AzFuswAZ-g==';  // Replace with your Azure Function Key
  private azureFunctionAnalyticsKey = 'H4SpbYfbQ25yNlBMpqg-2_WFyZxhglOue9-8oBhipvOQAzFua9pd1A=='; // Replace with your Azure Function Analytics Key

  constructor(private http: HttpClient) { }

  register(registrationData: any): Observable<any> {
    return this.http.post(`${this.azureFunctionUrl}/registerPublisher?code=${this.azureFunctionKey}`, registrationData);
  }

  validatePublisher(publisherId: string): Observable<any> {
    return this.http.get(`${this.azureFunctionUrl}/validatePublisher/${publisherId}?code=${this.azureFunctionKey}`);
  }

  getPublisherStatus() {
    return this.http.get<{ status: string }>(`${this.azureFunctionUrl}/publisher/status?code=${this.azureFunctionKey}`).pipe(
      map((response: { status: string }) => response.status)
    );
  }

  fetchPublisherAnalytics(publisherId: string): Observable<any> {
    return this.http.post(`${this.azureFunctionUrl}/fetchPublisherAnalytics?code=${this.azureFunctionAnalyticsKey}`, { publisherId });
  }

}
