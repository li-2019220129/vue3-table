<template>
    <div class="content">
        <div class="content-header"></div>

        <div class="content-body">
            <div class="content-body-inner">
                <h1>121221</h1>
                <h1>121221</h1>
                <h1>121221</h1>
                <h1>121221</h1>
                <h1>121221</h1>
                <h1>121221</h1>
                <h1>121221</h1>
                <h1>121221</h1>
            </div>
        </div>

        <div class="content-footer"></div>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 400px;
    margin: auto;
    background: pink;
}

.content-header {
    background: blue;
    height: 50px;
}

.content-body {
    flex: 1;
    background: red;
    overflow: auto;
    display: flex;
}

.content-body-inner {
    margin: auto 0;
    /* 垂直居中 */
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.content-footer {
    background: yellow;
    height: 50px;
}
</style>
