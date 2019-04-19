// name: image-out
<!DOCTYPE html>
<div id="{{'stream-view-'+$id}}">
    <img id="{{'stream-viewer-'+$id}}"  style="{{'max-width:100%'}}" src="{{$imageUrl}}">
</div>
<script>
(function(scope) {
  scope.$watch('msg', (msg) => {
    try {
        scope.$imageUrl = "";
        if (msg && msg.payload) {
            let blob;
            let payload = msg.payload;
            //  console.log("new message", payload, typeof payload);
            if (payload && typeof payload === 'string') {
                let base64Flag = 'data:image/png;base64,';
                if (msg.mimetype) {
                    base64Flag = `data:image/${msg.mimetype};base64,`;
                }
                blob = (fetch(`${base64Flag}${payload}`)).blob();
            } else if (payload.type && payload.type === 'Buffer') {
                //  blob = new Blob([Buffer.from(payload.data)]);
                blob = new Blob([new Uint8Array(payload.data)]);
            } else {
                blob = new Blob([msg.payload]);
            }
            if (!blob) throw new Error("No Blob");
            console.log("new blob", blob)
            const urlCreator = window.URL || window.webkitURL;
            scope.$imageUrl = urlCreator.createObjectURL(blob);
        }
        return msg;
      }catch(error){
          return error;
      }

  });
})(scope);
</script>