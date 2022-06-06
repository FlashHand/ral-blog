# WKWebView+JSPatch注入代码，实现H5与原生页面的灵活交互
**JSPatch存在审核被拒问题，建议参考JSPatch实现自己的热更新工具。**

[[toc]]

## 需要解决的问题
在WKWebView中常用的H5和原生交互的方式有
- url拦截的方式
- message-handler

这些方式有一个问题就是，需要提前写好Native代码，以供H5调用。
假设突然需要发布一个H5页面，该H5页面要跳转到某个原生页面，并且点击原生页面里的某个按钮。
一般开发会需要先开发相应原生功能，然后才能支持H5使用该功能。这样会导致H5需要等待APP发布后才能发布，而且该功能无法及时覆盖所有用户。

有一种另类的方法，可以让H5实现高度灵活的与Native进行通信。

将WKWebView和JSPatch结合起来使用，从而向APP里注入代码。

这样做能让H5页面和原生页面的交互大大加强，而不需要APP发布。

若不了解JSPatch可以先看看[JSPatch](https://github.com/bang590/JSPatch).

#### Demo地址，clone后直接运行即可。
```shell
#https://github.com/FlashHand/WKWebView-JSPatch
git clone git@github.com:FlashHand/WKWebView-JSPatch.git
```
## 实现过程
### LoadScript，加载JSPatch脚本。
#### 在H5中
*loadScript*函数通过messageHandlers向WKWebView发送了发送了JSPatch脚本。
```html
<input type="button" value="LoadScript" onclick="loadScript()">
```

```javascript
function loadScript() {
  window.webkit.messageHandlers.LoadScript.postMessage(`require\('SecondViewController');
  defineClass('ViewController',{
  goSecondVC: function() {
  var svc=SecondViewController.alloc().init();
  self.presentViewController_animated_completion(svc,YES,null);
},});`);
}
```
#### 在Native中
初始化WKWebView
注册两个message handler
- LoadScript:用来接受JSPatch脚本
- DoFunction:向Native发送需要执行的方法名和参数，通过**performSelectorOnMainThread**来执行来执行通过JSPatch在运行时申明的新方法。
```objectivec
_rwWebView=[[WKWebView alloc]initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height)];
//注册两个Handler
[_rwWebView.configuration.userContentController addScriptMessageHandler:self name:@"LoadScript"];
[_rwWebView.configuration.userContentController addScriptMessageHandler:self name:@"DoFunction"];
[self.view addSubview:_rwWebView];
//...
NSURL *url=[[NSBundle mainBundle]URLForResource:@"index" withExtension:@"html"];
NSMutableURLRequest *tmpRequest=[[NSMutableURLRequest alloc] initWithURL:url];
tmpRequest.timeoutInterval=60;
[_rwWebView loadRequest:tmpRequest];
```
```
#pragma mark - MessageHandler
- (void)userContentController:(WKUserContentController *)userContentController
      didReceiveScriptMessage:(WKScriptMessage *)message{
    if ([message.name isEqualToString:@"LoadScript"]) {
        NSString *script=message.body;
        [JPEngine evaluateScript:script];
        NSLog(@"Script loaded");
    }
    else if ([message.name isEqualToString:@"DoFunction"])
    {
        NSDictionary *messageDic=message.body;
        NSString *function=messageDic[@"function"];
        NSDictionary *parameters=messageDic[@"parameters"];
        if ([self respondsToSelector:NSSelectorFromString(function)]) {
            [self performSelectorOnMainThread:NSSelectorFromString(function) withObject:parameters waitUntilDone:YES];
            NSLog(@"Script excuted");
        }
        else NSLog(@"Please load script first");
    }
    
}
```


postMessage()里面的参数可以是：Number, String, Date, Array,
Dictionary, and null.和OC对应关系为:

|JS|OC|
|:---|:---|
|Number|NSNumber|
|String|NSString|
|Date|NSDate|
|Array|NSArray|
|Dictionary|NSDictionary|
|null|NSNull|
下面是JSPatch注释:

```
/*! @abstract The body of the message.
@discussion Allowed types are NSNumber, NSString, NSDate, NSArray,
NSDictionary, and NSNull.
*/
@property (nonatomic, readonly, copy) id body;
```

[JPEngine evaluateScript:script]将会基于runtime注册类，为类添加方法等。

### DoFunction，运行时执行OC方法。
H5执行doFunction后会执行：
```objectivec
else if ([message.name isEqualToString:@"DoFunction"])
    {
        NSDictionary *messageDic=message.body;
        NSString *function=messageDic[@"function"];
        NSDictionary *parameters=messageDic[@"parameters"];
        if ([self respondsToSelector:NSSelectorFromString(function)]) {
            [self performSelectorOnMainThread:NSSelectorFromString(function) withObject:parameters waitUntilDone:YES];
            NSLog(@"Script excuted");

        }
        else NSLog(@"Please load script first");
    }
```
很简单的实现了H5向原生注入代码。

已知的问题：
1. 向服务器请求JSPatch脚本需要进行加密加签处理，以防止被破解或攻击。
2. JSPatch存在审核被拒问题，建议参考JSPatch实现自己的热更新工具。
