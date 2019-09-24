// name: stream-out
<!DOCTYPE html>
<div id="{{'stream-view-'+$id}}" style="{{'text-align:center; max-height:100%'}}">
    <p ng-style="{{$fontStyle}}"> {{ $textValue }}</p>
    <img id="{{'stream-viewer-'+$id}}"  style="{{'max-width:100%; max-height:90%'}}"  src="{{$imageUrl}}">
</div>
<script>
(function(scope) {
  scope.$watch('msg', (msg) => {
    try {
        scope.$msg = msg;
        //scope.$imageUrl = "";"
        scope.$textValue = "stream :";
        scope.$fontStyle = {
            'font-size': '20px',
            'color': '#FFF',
            'font-weight': 'bold'
        };
        if (msg.payload === true) {
            scope.$imageUrl = msg.url;
        } else {
            scope.$imageUrl = "";
        }
    } catch(error){
        return error;
    }
  });
})(scope);
</script>
