import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


const url = 'http://localhost:3000/api/chatapp';
@Injectable({
  providedIn: 'root'
})
export class PostService {

constructor(private http: HttpClient) { }

addPost(body): Observable<any> {
  return this.http.post(`${url}/post/add-post`, body);
}

}
