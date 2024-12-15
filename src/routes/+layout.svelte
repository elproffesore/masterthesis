<script>
	import '../app.css';
</script>
<div class="w-full h-[50px] fixed z-10 bg-white" style="box-shadow: 0px 25px 15px #ffffff;"></div>
<div class="py-[100px]"><slot/></div>
<div class="w-full h-[50px] fixed bottom-0 z-10 bg-white" style="box-shadow: 0px -25px 15px #ffffff;"></div>


<style>
	:global(html){
		font-family: "Cormorant Garamond", serif;
		font-weight: 400;
		font-size: 1.3em;
		line-height: 1.5;
	}
	:global(h1){
		font-family: "Cormorant Garamond", serif;
		font-weight: 900;
		font-size: 1.7em;
	}
	:global(h2){
		font-family: "Cormorant Garamond", serif;
		font-weight: 900;
		font-size: 1.5em;
	}
</style>