// name: image-out
<!DOCTYPE html>
<div id="{{'stream-view-'+$id}}" style="{{'text-align:center; max-height:100%'}}">
    <img id="{{'stream-viewer-'+$id}}"  style="{{'max-width:100%; max-height:90%'}}"  src="{{$imageUrl}}">
    <p ng-style="{{$fontStyle}}"> {{ $textValue }}</p>
</div>
<script>
(function(scope) {
  scope.$watch('msg', (msg) => {
    try {
        scope.$textValue = "test";
        scope.$fontStyle = {
            'font-size': '20px',
            'color': 'blue',
            'font-weight': 'bold'
        };
        //  scope.$imageUrl = "";
        if (msg && msg.payload) {
            let blob;
            let payload = msg.payload;
            let contentType = "jpeg";
            if (msg.mimetype) contentType = msg.mimetype;
            console.log("new pic for camera", payload, typeof payload);
            //console.log("isBuffer?", payload instanceof Buffer);
            if (payload && typeof payload === 'string') {
                const base64Flag = `data:image/${contentType};base64,`;
                blob = (fetch(`${base64Flag}${payload}`)).blob();
            } else if (payload.type && payload.type === 'Buffer') {
                blob = new Blob([Uint8Array.from(payload.data)], { type: contentType });
            } else if (payload instanceof ArrayBuffer) {
                blob = new Blob([payload], { type: contentType });
            } else {
                blob = new Blob([Uint8Array.from(payload)], { type: contentType });
            } 
            if (!blob) throw new Error("No Blob");
            blob.lastModifiedDate = new Date();
            blob.name =  "camera-2";
            console.log("new blob for camera", blob)
            const urlCreator = window.URL || window.webkitURL;
            scope.$imageUrl = urlCreator.createObjectURL(blob);
            msg.payload = blob;
            return msg;
        }
        return null;;
    } catch(error){
        return error;
    }
  });
})(scope);
</script>
