<script>
    import { textModels,relations } from "$lib/stores";
    import { text } from "@sveltejs/kit";

   let { textModel = $bindable(), commentFunctionDisplay = $bindable(), commentFunctionActive = $bindable()} = $props();
    let tempComment = $state('')
    function submitComment() {
        if (tempComment.trim()) {
            textModel.comments.push(tempComment)
            tempComment = '';
            $textModels = $textModels;
            $relations = $relations;
            commentFunctionDisplay = false;
            commentFunctionActive = false;
        }
    }
    function checkSend(){
        if(event.key === 'Enter' && !event.shiftKey){
            submitComment();
        }
    }
</script>
<input class="absolute top-[100%] bg-[#fffff8] text-[#111111] -mt-4 py-px px-4 pl-0 border-b focus:outline-none focus:border-b-[#aa0000]" onkeydown="{checkSend}" bind:value={tempComment}/>
